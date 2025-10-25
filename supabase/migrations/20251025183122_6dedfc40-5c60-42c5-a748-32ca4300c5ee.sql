-- Create storage bucket for dispute evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('dispute-evidence', 'dispute-evidence', false);

-- Create RLS policies for dispute evidence bucket
CREATE POLICY "Users can view their own evidence"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'dispute-evidence' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own evidence"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'dispute-evidence' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own evidence"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'dispute-evidence' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add evidence_urls column to disputes table
ALTER TABLE public.disputes
ADD COLUMN evidence_urls text[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN public.disputes.evidence_urls IS 'Array of storage paths for supporting documents';