-- Create storage bucket for credit reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('credit-reports', 'credit-reports', false);

-- Storage policies for credit reports
CREATE POLICY "Users can upload own credit reports"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'credit-reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own credit reports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'credit-reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own credit reports"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'credit-reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );