
-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Profiles insert by owner"  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Profiles update by owner"  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Subscribers (Pro status, written by service role from edge fn)
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  stripe_customer_id text,
  subscribed boolean NOT NULL DEFAULT false,
  subscription_tier text,
  subscription_end timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscribers select own" ON public.subscribers FOR SELECT
  USING (user_id = auth.uid() OR email = auth.email());

-- Synced state (one row per (user, key) — JSON blob mirroring localStorage)
CREATE TABLE public.user_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, key)
);
ALTER TABLE public.user_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_state select own" ON public.user_state FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_state insert own" ON public.user_state FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_state update own" ON public.user_state FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_state delete own" ON public.user_state FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX user_state_user_idx ON public.user_state(user_id);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_user_state_updated BEFORE UPDATE ON public.user_state
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
