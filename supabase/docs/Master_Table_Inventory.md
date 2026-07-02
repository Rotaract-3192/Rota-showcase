# Master Table Inventory
### Rotaract District 3192 Web Portal

This document serves as the master checklist of all physical PostgreSQL tables required in the Supabase database.

| Table Name | Module | Type | Primary Key | Soft Delete | Description |
|------------|--------|------|-------------|-------------|-------------|
| `districts` | Organization | Table | `id` (UUID) | No | Root district entity. |
| `clubs` | Organization | Table | `id` (UUID) | Yes (`deleted_at`) | Rotaract clubs. |
| `member_profiles` | Identity | Table | `id` (UUID) | Yes | Core user profiles tied to Auth. |
| `member_roles` | Identity | Table | `id` (UUID) | No | RBAC mapping for users. |
| `activities` | Activities | Table | `id` (UUID) | Yes | Events and projects. |
| `registrations` | Activities | Table | `id` (UUID) | No | Event RSVPs and tickets. |
| `meetings` | Meetings | Table | `id` (UUID) | Yes | Club MOMs and attendance. |
| `orientations` | Orientations | Table | `id` (UUID) | Yes | Member induction records. |
| `installations` | Installations| Table | `id` (UUID) | Yes | Annual club setups. |
| `dovs` | Dist. Official Visits| Table | `id` (UUID) | Yes | District evaluations. |
| `point_ledgers` | Leaderboards | Log Table| `id` (UUID) | No | Append-only point history. |
| `leaderboard_rankings` | Leaderboards | Mat View | `club_id` (UUID) | N/A | Aggregated ranking data. |
| `notifications` | Notifications | Table | `id` (UUID) | No (Hard Delete) | In-app alerts. |
| `analytics_events` | Analytics | Table | `id` (UUID) | No | Usage metrics (Partitioned). |
| `audit_logs` | Administration| Table | `id` (UUID) | No | Immutable audit trail. |
| `showcase_features`| Public Showcase| Table | `id` (UUID) | No | Featured activities. |
| `club_website_configs`| Website Builder| Table | `id` (UUID) | No | Club custom landing page data. |
| `ai_jobs` | AI | Table | `id` (UUID) | No | Audio transcription states. |
| `cron_jobs` | System | Table | `id` (UUID) | No | System-level scheduling. |

---
**Total Physical Tables:** 18  
**Materialized Views:** 1  
**Primary Key Standard:** `uuid-v4`  
**Timestamp Standard:** `created_at`, `updated_at` (timestamptz)
