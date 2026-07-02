-- 006_seed_reference.sql
-- Inserts the master reference data required for the system to boot successfully.
-- Uses explicit deterministic UUIDs and ON CONFLICT handling to ensure idempotency.

-- 1. Insert the root District 3192 record
INSERT INTO districts (id, name, number, logo_url)
VALUES (
    'd157a16b-1234-4b45-9a8b-319200000000', -- Deterministic UUID for the master district
    'Rotaract District 3192',
    '3192',
    'https://example.com/d3192_logo.png'
)
ON CONFLICT (number) DO UPDATE 
SET name = EXCLUDED.name, logo_url = EXCLUDED.logo_url;

-- 2. Insert a default Super Admin system actor for automated cron/AI jobs
INSERT INTO member_profiles (id, auth_id, first_name, last_name, email)
VALUES (
    '5057e100-0000-4000-8000-000000000001', -- Deterministic UUID
    'system_auth_id',
    'System',
    'Automations',
    'system@rotaract3192.org'
)
ON CONFLICT (email) DO UPDATE 
SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, updated_at = NOW();

-- 3. Assign the Super Admin role to the system actor
-- No unique constraint exists on member_roles, so we use a safe EXISTS check to maintain idempotency
INSERT INTO member_roles (member_id, role)
SELECT '5057e100-0000-4000-8000-000000000001', 'Super Admin'
WHERE NOT EXISTS (
    SELECT 1 FROM member_roles 
    WHERE member_id = '5057e100-0000-4000-8000-000000000001' 
    AND role = 'Super Admin'
);
