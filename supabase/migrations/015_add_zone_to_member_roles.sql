-- 015_add_zone_to_member_roles.sql
-- Add zone to member_roles table

ALTER TABLE public.member_roles ADD COLUMN IF NOT EXISTS zone VARCHAR(50);
