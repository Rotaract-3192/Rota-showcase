-- 021_unique_club_officers.sql
-- Each club may have only one active President and one active Secretary.
-- Soft-delete older duplicate role rows (keep the newest), then add unique indexes.

WITH ranked AS (
  SELECT
    mr.id,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(mr.club_id, mp.club_id), mr.role
      ORDER BY mr.created_at DESC NULLS LAST, mr.id DESC
    ) AS rn
  FROM member_roles mr
  LEFT JOIN member_profiles mp ON mp.id = mr.member_id
  WHERE mr.deleted_at IS NULL
    AND mr.role IN ('President', 'Secretary')
    AND COALESCE(mr.club_id, mp.club_id) IS NOT NULL
)
UPDATE member_roles
SET deleted_at = NOW()
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Unique active President per club (role.club_id set)
CREATE UNIQUE INDEX IF NOT EXISTS unq_member_roles_one_president_per_club
  ON member_roles (club_id)
  WHERE deleted_at IS NULL
    AND role = 'President'
    AND club_id IS NOT NULL;

-- Unique active Secretary per club (role.club_id set)
CREATE UNIQUE INDEX IF NOT EXISTS unq_member_roles_one_secretary_per_club
  ON member_roles (club_id)
  WHERE deleted_at IS NULL
    AND role = 'Secretary'
    AND club_id IS NOT NULL;
