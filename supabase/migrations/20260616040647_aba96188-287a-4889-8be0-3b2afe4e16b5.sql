CREATE TABLE public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  period_month text NOT NULL, -- YYYY-MM in UTC
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_month)
);

GRANT SELECT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage select own" ON public.ai_usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER ai_usage_set_updated_at
  BEFORE UPDATE ON public.ai_usage
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Server-side increment with monthly free cap for non-subscribers.
-- Returns the new count and the limit. Raises exception when limit exceeded.
CREATE OR REPLACE FUNCTION public.consume_ai_run(_user_id uuid, _is_pro boolean, _limit int DEFAULT 3)
RETURNS TABLE(new_count int, monthly_limit int, is_pro boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _month text := to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM');
  _current int;
BEGIN
  INSERT INTO public.ai_usage (user_id, period_month, count)
  VALUES (_user_id, _month, 0)
  ON CONFLICT (user_id, period_month) DO NOTHING;

  SELECT count INTO _current FROM public.ai_usage
    WHERE user_id = _user_id AND period_month = _month FOR UPDATE;

  IF NOT _is_pro AND _current >= _limit THEN
    RAISE EXCEPTION 'ai_limit_reached' USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.ai_usage SET count = _current + 1, updated_at = now()
    WHERE user_id = _user_id AND period_month = _month;

  RETURN QUERY SELECT _current + 1, _limit, _is_pro;
END; $$;

GRANT EXECUTE ON FUNCTION public.consume_ai_run(uuid, boolean, int) TO authenticated, service_role;
