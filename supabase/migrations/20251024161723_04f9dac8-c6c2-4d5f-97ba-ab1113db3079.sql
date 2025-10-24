-- Add updated_at triggers to remaining tables (skip disputes as it already exists)

-- Trigger for flagged_items table (add updated_at column first)
ALTER TABLE public.flagged_items 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

CREATE TRIGGER update_flagged_items_updated_at
BEFORE UPDATE ON public.flagged_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for credit_reports table (add updated_at column first)
ALTER TABLE public.credit_reports 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

CREATE TRIGGER update_credit_reports_updated_at
BEFORE UPDATE ON public.credit_reports
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add email preferences table for notification settings
CREATE TABLE public.email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  notify_analysis_complete BOOLEAN DEFAULT true,
  notify_dispute_deadline BOOLEAN DEFAULT true,
  notify_score_update BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email preferences"
ON public.email_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
ON public.email_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences"
ON public.email_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_email_preferences_updated_at
BEFORE UPDATE ON public.email_preferences
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();