-- 011_add_zone_to_access_requests.sql
-- Add zone to access_requests table

ALTER TABLE public.access_requests ADD COLUMN IF NOT EXISTS zone VARCHAR(50);
