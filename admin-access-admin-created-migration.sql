-- Supports Super Admin-created pending administrator requests.
-- Run this once in Supabase SQL Editor.

ALTER TABLE public.admin_access_requests
ADD COLUMN IF NOT EXISTS created_by_admin_id bigint REFERENCES public.admin_users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_admin_access_requests_created_by_admin
ON public.admin_access_requests(created_by_admin_id);
