-- Add notification preferences
ALTER TABLE public.email_preferences 
ADD COLUMN IF NOT EXISTS notify_followup_needed boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_cfpb_escalation boolean NOT NULL DEFAULT true;

-- Create score simulation table
CREATE TABLE IF NOT EXISTS public.score_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  simulation_data JSONB NOT NULL,
  projected_score INTEGER CHECK (projected_score >= 300 AND projected_score <= 850),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.score_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own simulations" ON public.score_simulations 
FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Add evidence tracking to disputes
ALTER TABLE public.disputes 
ADD COLUMN IF NOT EXISTS cfpb_complaint_filed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cfpb_complaint_date timestamptz,
ADD COLUMN IF NOT EXISTS auto_followup_scheduled boolean DEFAULT false;

-- Create achievements table for gamification
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own achievements" ON public.user_achievements 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users earn achievements" ON public.user_achievements 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_disputes_deadline ON public.disputes(response_deadline) WHERE status = 'sent';
CREATE INDEX IF NOT EXISTS idx_disputes_followup ON public.disputes(user_id, status) WHERE auto_followup_scheduled = false;