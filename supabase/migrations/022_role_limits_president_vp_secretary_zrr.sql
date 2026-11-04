-- 022_role_limits_president_vp_secretary_zrr.sql
-- Limits:
--   President        → 1 per club
--   Vice President   → 1 per club
--   Secretary        → multiple (drop unique index)
--   ZRR              → 2 per zone (soft-trim extras; app enforces going forward)
--   DRS / Admin      → unlimited

-- Allow multiple Secretaries
DROP INDEX IF EXISTS unq_member_roles_one_secretary_per_club;

-- Soft-delete duplicate Vice Presidents (keep newest)
WITH ranked AS (
  SELECT
    mr.id,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(mr.club_id, mp.club_id)
      ORDER BY mr.created_at DESC NULLS LAST, mr.id DESC
    ) AS rn
  FROM member_roles mr
  LEFT JOIN member_profiles mp ON mp.id = mr.member_id
  WHERE mr.deleted_at IS NULL
    AND mr.role = 'Vice President'
    AND COALESCE(mr.club_id, mp.club_id) IS NOT NULL
)
UPDATE member_roles
SET deleted_at = NOW()
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Unique active Vice President per club
CREATE UNIQUE INDEX IF NOT EXISTS unq_member_roles_one_vp_per_club
  ON member_roles (club_id)
  WHERE deleted_at IS NULL
    AND role = 'Vice President'
    AND club_id IS NOT NULL;

-- Soft-delete excess ZRRs beyond 2 per zone (keep newest two)
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY zone
      ORDER BY created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM member_roles
  WHERE deleted_at IS NULL
    AND role = 'ZRR'
    AND zone IS NOT NULL
    AND btrim(zone) <> ''
)
UPDATE member_roles
SET deleted_at = NOW()
WHERE id IN (SELECT id FROM ranked WHERE rn > 2);

-- President unique index from 021 stays as-is.
