-- Fix remaining tables with anonymous access policies
-- Tables: analytics_events, email_preferences, error_logs, score_simulations, 
-- success_stories, user_achievements, storage.objects

-- ============================================
-- ANALYTICS_EVENTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can view all analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON public.analytics_events;

CREATE POLICY "Admins can view all analytics events"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own analytics events"
  ON public.analytics_events FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

-- ============================================
-- EMAIL_PREFERENCES TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own email preferences" ON public.email_preferences;
DROP POLICY IF EXISTS "Users can update own email preferences" ON public.email_preferences;
DROP POLICY IF EXISTS "Users can insert own email preferences" ON public.email_preferences;

CREATE POLICY "Users can view own email preferences"
  ON public.email_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
  ON public.email_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences"
  ON public.email_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ERROR_LOGS TABLE
-- ============================================
DROP POLICY IF EXISTS "Admins can view all error logs" ON public.error_logs;
DROP POLICY IF EXISTS "Users can insert their own error logs" ON public.error_logs;

CREATE POLICY "Admins can view all error logs"
  ON public.error_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own error logs"
  ON public.error_logs FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

-- ============================================
-- SCORE_SIMULATIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users manage own simulations" ON public.score_simulations;

CREATE POLICY "Users manage own simulations"
  ON public.score_simulations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- SUCCESS_STORIES TABLE
-- ============================================
DROP POLICY IF EXISTS "Anyone can view approved stories" ON public.success_stories;
DROP POLICY IF EXISTS "Users can view own stories" ON public.success_stories;
DROP POLICY IF EXISTS "Users can insert own stories" ON public.success_stories;
DROP POLICY IF EXISTS "Admins can manage all stories" ON public.success_stories;

-- Public can view approved stories (intentional for public showcase)
CREATE POLICY "Anyone can view approved stories"
  ON public.success_stories FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

CREATE POLICY "Users can view own stories"
  ON public.success_stories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stories"
  ON public.success_stories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all stories"
  ON public.success_stories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- USER_ACHIEVEMENTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users view own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users earn achievements" ON public.user_achievements;

CREATE POLICY "Users view own achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users earn achievements"
  ON public.user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STORAGE.OBJECTS POLICIES (credit-reports bucket)
-- ============================================
DROP POLICY IF EXISTS "Users can view own credit reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own credit reports" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own credit reports" ON storage.objects;

CREATE POLICY "Users can view own credit reports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'credit-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own credit reports"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'credit-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own credit reports"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'credit-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- STORAGE.OBJECTS POLICIES (dispute-evidence bucket)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own evidence" ON storage.objects;

CREATE POLICY "Users can view their own evidence"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'dispute-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own evidence"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'dispute-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own evidence"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'dispute-evidence' AND auth.uid()::text = (storage.foldername(name))[1]);