-- Migration: Add cover_image, supporting_image_1, and supporting_image_2 to all reporting tables

-- activities (already has cover_image)
ALTER TABLE activities ADD COLUMN IF NOT EXISTS supporting_image_1 TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS supporting_image_2 TEXT;

-- dovs
ALTER TABLE dovs ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE dovs ADD COLUMN IF NOT EXISTS supporting_image_1 TEXT;
ALTER TABLE dovs ADD COLUMN IF NOT EXISTS supporting_image_2 TEXT;

-- installations
ALTER TABLE installations ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE installations ADD COLUMN IF NOT EXISTS supporting_image_1 TEXT;
ALTER TABLE installations ADD COLUMN IF NOT EXISTS supporting_image_2 TEXT;

-- meetings
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS supporting_image_1 TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS supporting_image_2 TEXT;

-- orientations
ALTER TABLE orientations ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE orientations ADD COLUMN IF NOT EXISTS supporting_image_1 TEXT;
ALTER TABLE orientations ADD COLUMN IF NOT EXISTS supporting_image_2 TEXT;
