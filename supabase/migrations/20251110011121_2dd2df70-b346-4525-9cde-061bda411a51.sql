-- Create action plans table for weekly/daily tasks
CREATE TABLE IF NOT EXISTS public.action_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  action_type TEXT NOT NULL, -- 'dispute', 'payment', 'application', 'follow_up'
  priority TEXT NOT NULL DEFAULT 'medium', -- 'high', 'medium', 'low'
  estimated_impact INTEGER, -- Expected score points
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB -- Store additional context
);

-- Create credit milestones table for timeline tracking
CREATE TABLE IF NOT EXISTS public.credit_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  milestone_type TEXT NOT NULL, -- 'score_goal', 'dispute_win', 'debt_free', 'account_opened'
  target_score INTEGER,
  target_date TIMESTAMP WITH TIME ZONE,
  achieved BOOLEAN NOT NULL DEFAULT false,
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT,
  metadata JSONB
);

-- Create goodwill letters table
CREATE TABLE IF NOT EXISTS public.goodwill_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  creditor_name TEXT NOT NULL,
  account_number TEXT,
  late_payment_date DATE,
  letter_content TEXT NOT NULL,
  reason TEXT, -- User's reason for late payment
  relationship_length TEXT, -- How long they've been a customer
  status TEXT DEFAULT 'draft', -- 'draft', 'sent', 'approved', 'denied'
  sent_date TIMESTAMP WITH TIME ZONE,
  response_date TIMESTAMP WITH TIME ZONE,
  outcome TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bureau responses table
CREATE TABLE IF NOT EXISTS public.bureau_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  dispute_id UUID REFERENCES public.disputes(id) ON DELETE CASCADE,
  bureau TEXT NOT NULL, -- 'Equifax', 'Experian', 'TransUnion'
  response_type TEXT NOT NULL, -- 'deleted', 'verified', 'updated', 'no_response'
  response_date TIMESTAMP WITH TIME ZONE,
  response_document_url TEXT,
  items_affected JSONB, -- Array of affected items
  next_action TEXT, -- Suggested next step
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goodwill_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bureau_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for action_plans
CREATE POLICY "Users manage own action plans"
  ON public.action_plans
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for credit_milestones
CREATE POLICY "Users manage own milestones"
  ON public.credit_milestones
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for goodwill_letters
CREATE POLICY "Users manage own goodwill letters"
  ON public.goodwill_letters
  FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for bureau_responses
CREATE POLICY "Users manage own responses"
  ON public.bureau_responses
  FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_action_plans_user_due ON public.action_plans(user_id, due_date) WHERE NOT completed;
CREATE INDEX idx_milestones_user_target ON public.credit_milestones(user_id, target_date) WHERE NOT achieved;
CREATE INDEX idx_goodwill_user_status ON public.goodwill_letters(user_id, status);
CREATE INDEX idx_responses_dispute ON public.bureau_responses(dispute_id);

-- Add triggers for updated_at
CREATE TRIGGER update_goodwill_letters_updated_at
  BEFORE UPDATE ON public.goodwill_letters
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();