DROP POLICY IF EXISTS "Subscribers select own" ON public.subscribers;
CREATE POLICY "Subscribers select own" ON public.subscribers FOR SELECT TO authenticated USING (user_id = auth.uid());