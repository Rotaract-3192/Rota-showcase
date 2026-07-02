# Supabase Database Schema
### Rotaract District 3192 Web Portal

**Version:** 1.0  
**Purpose:** To define the module-wise logical database schema, outlining all tables, keys, constraints, and indexes before writing raw SQL migrations.

---

## 1. Organization Module
Manages the district and clubs.
* **Enums:** `club_status_enum` (ACTIVE, INACTIVE, SUSPENDED)
* **Tables:**
  * `districts` (id, name, number, logo_url, created_at, updated_at)
  * `clubs` (id, district_id, name, slug, status, founded_date, charter_date, logo_url)
* **Foreign Keys:** `clubs.district_id` -> `districts.id`
* **Indexes:** `idx_clubs_district_id`, `idx_clubs_slug`
* **Constraints:** Unique `clubs.slug`

## 2. Identity Module
Manages user profiles and access control mapping.
* **Tables:**
  * `member_profiles` (id, auth_id, club_id, first_name, last_name, email, phone, blood_group, avatar_url, deleted_at)
  * `member_roles` (id, member_id, role, club_id)
* **Foreign Keys:** 
  * `member_profiles.club_id` -> `clubs.id`
  * `member_roles.member_id` -> `member_profiles.id`
* **Indexes:** `idx_profiles_auth_id`, `idx_profiles_email`, `idx_roles_member_id`
* **Constraints:** Unique `auth_id`, Unique `email`

## 3. Activities Module
Manages events, projects, and registrations.
* **Enums:** `activity_status_enum` (DRAFT, PUBLISHED, CANCELLED), `activity_type_enum` (EVENT, PROJECT)
* **Tables:**
  * `activities` (id, club_id, title, slug, type, description, start_time, end_time, venue, status)
  * `registrations` (id, activity_id, member_id, status)
* **Foreign Keys:** `activities.club_id` -> `clubs.id`, `registrations.activity_id` -> `activities.id`
* **Indexes:** `idx_activities_club_id`, `idx_activities_start_time`
* **Constraints:** Unique `(activity_id, member_id)`

## 4. Meetings Module
Manages club meeting minutes (MOMs).
* **Tables:**
  * `meetings` (id, club_id, date, minutes_text, attendees_count, audio_url, transcript_text)
* **Foreign Keys:** `meetings.club_id` -> `clubs.id`
* **Indexes:** `idx_meetings_club_id`, `idx_meetings_date`

## 5. Orientations Module
Manages club member orientations.
* **Tables:**
  * `orientations` (id, club_id, date, speaker_name, new_members_inducted, remarks)
* **Foreign Keys:** `orientations.club_id` -> `clubs.id`
* **Indexes:** `idx_orientations_club_id`

## 6. Installations Module
Manages the annual club installations.
* **Tables:**
  * `installations` (id, club_id, date, venue, incoming_president_id, chief_guest)
* **Foreign Keys:** 
  * `installations.club_id` -> `clubs.id`
  * `installations.incoming_president_id` -> `member_profiles.id`

## 7. District Official Visits (DOV) Module
Manages evaluations by district officials.
* **Tables:**
  * `dovs` (id, club_id, visiting_official_id, date, evaluation_score, remarks)
* **Foreign Keys:** 
  * `dovs.club_id` -> `clubs.id`
  * `dovs.visiting_official_id` -> `member_profiles.id`

## 8. Leaderboards Module
Gamification and club rankings.
* **Tables:**
  * `point_ledgers` (id, club_id, member_id, points, reason, awarded_at)
  * `leaderboard_rankings` (Materialized View aggregating points per club)
* **Foreign Keys:** `point_ledgers.club_id` -> `clubs.id`
* **Indexes:** `idx_points_club_id`

## 9. Notifications Module
System alerts and push notifications.
* **Tables:**
  * `notifications` (id, recipient_id, title, message, is_read, created_at)
* **Foreign Keys:** `notifications.recipient_id` -> `member_profiles.id`
* **Indexes:** `idx_notif_recipient_unread`

## 10. Analytics Module
System usage tracking and reporting.
* **Tables:**
  * `analytics_events` (id, event_name, payload, user_id, created_at)
* **Indexes:** `idx_analytics_event_name`, `idx_analytics_created_at` (Partitioned by month)

## 11. Administration Module
Global settings and audit logs.
* **Tables:**
  * `audit_logs` (id, actor_id, table_name, record_id, action, old_data, new_data)
* **Foreign Keys:** `audit_logs.actor_id` -> `member_profiles.id`
* **Indexes:** `idx_audit_table_record`

## 12. Public Showcase Module
Content for the public website.
* **Tables:**
  * `showcase_features` (id, activity_id, title, highlight_image_url, is_active)
* **Foreign Keys:** `showcase_features.activity_id` -> `activities.id`

## 13. Club Website Builder Module
Customizations for club landing pages.
* **Tables:**
  * `club_website_configs` (id, club_id, theme_color, hero_text, social_links)
* **Foreign Keys:** `club_website_configs.club_id` -> `clubs.id`
* **Constraints:** Unique `club_id` (1:1 mapping)

## 14. AI Module
Transcriptions and AI-generated insights.
* **Tables:**
  * `ai_jobs` (id, resource_type, resource_id, status, result_payload, created_at)
* **Enums:** `ai_job_status` (PENDING, PROCESSING, COMPLETED, FAILED)
* **Indexes:** `idx_ai_jobs_status`

## 15. System Module
Core background jobs and cron configurations.
* **Tables:**
  * `cron_jobs` (id, task_name, schedule, last_run, next_run)
