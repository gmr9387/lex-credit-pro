-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for user-submitted success stories
CREATE TABLE public.success_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  initial_score INTEGER NOT NULL,
  final_score INTEGER NOT NULL,
  timeframe_months INTEGER NOT NULL,
  items_removed INTEGER NOT NULL DEFAULT 0,
  testimony TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Users can submit their own stories
CREATE POLICY "Users can insert own stories" 
ON public.success_stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own stories
CREATE POLICY "Users can view own stories" 
ON public.success_stories 
FOR SELECT 
USING (auth.uid() = user_id);

-- Everyone can view approved stories
CREATE POLICY "Anyone can view approved stories" 
ON public.success_stories 
FOR SELECT 
USING (is_approved = true);

-- Admins can manage all stories
CREATE POLICY "Admins can manage all stories" 
ON public.success_stories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_success_stories_updated_at
BEFORE UPDATE ON public.success_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();