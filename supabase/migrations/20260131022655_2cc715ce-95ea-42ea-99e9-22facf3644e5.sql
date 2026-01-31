-- Fix anonymous access policies by adding TO authenticated clause
-- Tables affected: profiles, credit_reports, flagged_items, disputes, score_snapshots, 
-- action_plans, credit_milestones, bureau_responses, goodwill_letters, user_roles

-- ============================================
-- PROFILES TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CREDIT_REPORTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own reports" ON public.credit_reports;
DROP POLICY IF EXISTS "Users can update own reports" ON public.credit_reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON public.credit_reports;

CREATE POLICY "Users can view own reports"
  ON public.credit_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON public.credit_reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON public.credit_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FLAGGED_ITEMS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own flagged items" ON public.flagged_items;
DROP POLICY IF EXISTS "Users can manage own flagged items" ON public.flagged_items;

CREATE POLICY "Users can view own flagged items"
  ON public.flagged_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own flagged items"
  ON public.flagged_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- DISPUTES TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own disputes" ON public.disputes;
DROP POLICY IF EXISTS "Users can manage own disputes" ON public.disputes;

CREATE POLICY "Users can view own disputes"
  ON public.disputes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own disputes"
  ON public.disputes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- SCORE_SNAPSHOTS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own snapshots" ON public.score_snapshots;
DROP POLICY IF EXISTS "Users can insert own snapshots" ON public.score_snapshots;

CREATE POLICY "Users can view own snapshots"
  ON public.score_snapshots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snapshots"
  ON public.score_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ACTION_PLANS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users manage own action plans" ON public.action_plans;

CREATE POLICY "Users manage own action plans"
  ON public.action_plans FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- CREDIT_MILESTONES TABLE
-- ============================================
DROP POLICY IF EXISTS "Users manage own milestones" ON public.credit_milestones;

CREATE POLICY "Users manage own milestones"
  ON public.credit_milestones FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- BUREAU_RESPONSES TABLE
-- ============================================
DROP POLICY IF EXISTS "Users manage own responses" ON public.bureau_responses;

CREATE POLICY "Users manage own responses"
  ON public.bureau_responses FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- GOODWILL_LETTERS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users manage own goodwill letters" ON public.goodwill_letters;

CREATE POLICY "Users manage own goodwill letters"
  ON public.goodwill_letters FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- USER_ROLES TABLE (fix anonymous access)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));