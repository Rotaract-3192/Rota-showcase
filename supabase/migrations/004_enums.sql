-- 004_enums.sql
-- Defines database-level enumerations to strictly enforce valid status values.
-- Properly handles casting to enums by explicitly dropping and resetting defaults.

DO $$ BEGIN
  CREATE TYPE club_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE activity_status_enum AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE activity_type_enum AS ENUM ('EVENT', 'PROJECT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE registration_status_enum AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE ai_job_status_enum AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- Convert clubs.status
ALTER TABLE clubs ALTER COLUMN status DROP DEFAULT;
ALTER TABLE clubs ALTER COLUMN status TYPE club_status_enum USING status::club_status_enum;
ALTER TABLE clubs ALTER COLUMN status SET DEFAULT 'ACTIVE'::club_status_enum;

-- Convert activities.status
ALTER TABLE activities ALTER COLUMN status DROP DEFAULT;
ALTER TABLE activities ALTER COLUMN status TYPE activity_status_enum USING status::activity_status_enum;
ALTER TABLE activities ALTER COLUMN status SET DEFAULT 'DRAFT'::activity_status_enum;

-- Convert activities.type (No default set originally, but requires casting)
-- Data may exist if migrated from existing system, safely cast it
-- Assuming 'EVENT' as fallback if empty string was passed
ALTER TABLE activities ALTER COLUMN type TYPE activity_type_enum USING (
    CASE 
        WHEN type = '' THEN 'EVENT'::activity_type_enum 
        ELSE type::activity_type_enum 
    END
);

-- Convert registrations.status
ALTER TABLE registrations ALTER COLUMN status DROP DEFAULT;
ALTER TABLE registrations ALTER COLUMN status TYPE registration_status_enum USING status::registration_status_enum;
ALTER TABLE registrations ALTER COLUMN status SET DEFAULT 'PENDING'::registration_status_enum;

-- Convert ai_jobs.status
ALTER TABLE ai_jobs ALTER COLUMN status DROP DEFAULT;
ALTER TABLE ai_jobs ALTER COLUMN status TYPE ai_job_status_enum USING status::ai_job_status_enum;
ALTER TABLE ai_jobs ALTER COLUMN status SET DEFAULT 'PENDING'::ai_job_status_enum;
