-- 013_add_club_fields.sql
-- Adds missing fields to the clubs table to support frontend queries.

ALTER TABLE public.clubs 
ADD COLUMN IF NOT EXISTS member_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_projects INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_points INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS email VARCHAR(255);
