ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS removed_by_admin boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS admin_removed_reason text;
