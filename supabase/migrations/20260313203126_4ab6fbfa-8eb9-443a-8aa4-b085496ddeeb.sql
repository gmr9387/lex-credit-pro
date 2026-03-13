
-- 1. Fix success_stories: remove anon access, keep authenticated-only
DROP POLICY IF EXISTS "Anyone can view approved stories" ON public.success_stories;
CREATE POLICY "Authenticated can view approved stories"
  ON public.success_stories FOR SELECT
  TO authenticated
  USING (is_approved = true);

-- 2. Allow users to SELECT their own analytics_events (for NotificationCenter)
CREATE POLICY "Users can view own analytics events"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Admin policies for user management panel
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all credit reports"
  ON public.credit_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all disputes"
  ON public.disputes FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all score snapshots"
  ON public.score_snapshots FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
