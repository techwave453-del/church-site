-- Adds encrypted delivery of the one-time activation credential.
-- Run this once in Supabase SQL Editor after admin_access_requests exists.

ALTER TABLE public.admin_access_requests
ADD COLUMN IF NOT EXISTS activation_code_ciphertext TEXT;

CREATE INDEX IF NOT EXISTS idx_admin_access_requests_status_created
ON public.admin_access_requests(status, created_at DESC);
