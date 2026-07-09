CREATE POLICY "ai_usage insert own" ON public.ai_usage FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_usage update own" ON public.ai_usage FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_usage no delete" ON public.ai_usage FOR DELETE TO authenticated USING (false);