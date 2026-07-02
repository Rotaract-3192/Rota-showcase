# L6 Architecture — Database Dictionary
### Rotaract District 3192 Web Portal

**Version:** 1.0  
**Last Updated:** 2026-07-01  
**Purpose:** To define the physical database schema, transforming logical entities into production-ready PostgreSQL tables.  
**Scope:** Covers all physical tables, data types, constraints, indexing strategies, and database-level rules for the Supabase (PostgreSQL) backend.  
**Audience:** Database Administrators, Backend Engineers, Full-Stack Developers.  

---

## Table of Contents
1. [Global Database Strategies](#global-database-strategies)
2. [Database Naming Standards](#database-naming-standards)
3. [Table Definitions (The Dictionary)](#table-definitions)
4. [Indexing Strategy](#indexing-strategy)
5. [Partitioning Strategy](#partitioning-strategy)
6. [Migration & Versioning Strategy](#migration--versioning-strategy)
7. [Database Scalability](#database-scalability)
8. [Best Practices](#best-practices)

---

## Global Database Strategies

### UUID Strategy
All primary keys (`id`) across all tables will use **UUID v4** (universally unique identifiers) instead of auto-incrementing integers. 
* **Why:** Prevents ID guessing (Insecure Direct Object Reference), allows client-side ID generation (helpful for offline PWA syncing), and simplifies database merging/sharding.
* **Default:** `gen_random_uuid()` (native to PostgreSQL 13+).

### Timestamp Strategy
* All tables include audit fields: `created_at` and `updated_at`.
* **Data Type:** `TIMESTAMP WITH TIME ZONE` (`timestamptz`). Always store time in UTC.
* **Default:** `now()`.
* The `updated_at` column is maintained automatically via a PostgreSQL trigger `set_updated_at()`.

### Soft Delete Strategy
* Hard deletions (DELETE statements) are heavily restricted to prevent orphaned foreign keys and to preserve financial/audit history.
* **Mechanism:** Tables use an `is_deleted` (BOOLEAN) or `deleted_at` (`timestamptz`) column. 
* Queries must include `WHERE deleted_at IS NULL`.
* **Exemptions:** Pivot/Junction tables (e.g., `attendance_records`) may use hard deletes if cascading from a parent deletion.

### Enums
Where a column has a fixed, small set of values, PostgreSQL `ENUM` types are used to enforce data integrity at the database layer.
* Example: `event_status_enum` ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED')
* Example: `payment_status_enum` ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')

### Composite Keys
Avoided for primary keys to keep ORM mapping simple. Used strictly for **Unique Constraints** to prevent duplicate relationships (e.g., `UNIQUE(user_id, event_id)` on registrations).

### Database Normalization
Targeting **3rd Normal Form (3NF)** for operational tables to avoid data anomalies. Read-heavy analytics (Leaderboards) use denormalized Materialised Views.

---

## Database Naming Standards

* **Tables:** Plural, snake_case (e.g., `member_profiles`, `ticket_tiers`).
* **Columns:** Singular, snake_case (e.g., `first_name`, `created_at`).
* **Primary Keys:** Always named `id`.
* **Foreign Keys:** Named `{singular_table_name}_id` (e.g., `club_id`).
* **Indexes:** `idx_{table_name}_{column_name}`.
* **Unique Constraints:** `unq_{table_name}_{column_names}`.
* **Boolean Columns:** Prefixed with `is_`, `has_`, or `can_` (e.g., `is_active`, `has_paid`).

---

## Table Definitions

### 1. `districts`
* **Purpose:** Stores the top-level organizational entity (e.g., District 3192).
* **Estimated Growth:** Static (1 row).
* **Soft Delete:** No.
* **Audit Fields:** `created_at`, `updated_at`.

| Column | Type | Nullable | Default | Constraints / References |
|--------|------|----------|---------|--------------------------|
| `id` | uuid | FALSE | `gen_random_uuid()` | Primary Key |
| `name` | varchar(100) | FALSE | | |
| `number` | varchar(20) | FALSE | | Unique Constraint |
| `logo_url` | text | TRUE | | |
| `theme_colors` | jsonb | TRUE | '{}' | |

### 2. `clubs`
* **Purpose:** Stores individual clubs operating under the district.
* **Estimated Growth:** 100-150 rows.
* **Soft Delete:** Yes (`deleted_at`).
* **Audit Fields:** `created_at`, `updated_at`.

| Column | Type | Nullable | Default | Constraints / References |
|--------|------|----------|---------|--------------------------|
| `id` | uuid | FALSE | `gen_random_uuid()` | Primary Key |
| `district_id` | uuid | FALSE | | FK to `districts(id)` |
| `name` | varchar(255) | FALSE | | |
| `slug` | varchar(255) | FALSE | | Unique Constraint, Indexed |
| `status` | club_status | FALSE | 'ACTIVE' | ENUM: ACTIVE, INACTIVE, SUSPENDED |
| `founded_date` | date | TRUE | | |
| `logo_url` | text | TRUE | | |

### 3. `member_profiles`
* **Purpose:** Central user record mapped to auth identity.
* **Estimated Growth:** 20,000+ rows.
* **Soft Delete:** Yes (`deleted_at` + DPDP Anonymization script).
* **Audit Fields:** `created_at`, `updated_at`.

| Column | Type | Nullable | Default | Constraints / References |
|--------|------|----------|---------|--------------------------|
| `id` | uuid | FALSE | `gen_random_uuid()` | Primary Key |
| `auth_id` | varchar(255)| FALSE | | Unique (Maps to Clerk/Supabase Auth) |
| `club_id` | uuid | TRUE | | FK to `clubs(id)` |
| `first_name`| varchar(100) | FALSE | | |
| `last_name` | varchar(100) | FALSE | | |
| `email` | varchar(255) | FALSE | | Unique Constraint, Indexed |
| `phone` | varchar(20) | TRUE | | |
| `blood_group`| varchar(5) | TRUE | | |
| `joined_date`| date | TRUE | | |
| `avatar_url` | text | TRUE | | |

### 4. `events`
* **Purpose:** Stores both district-level and club-level events.
* **Estimated Growth:** 500 - 2,000 rows/year.
* **Soft Delete:** Yes (`deleted_at`).
* **Audit Fields:** `created_at`, `updated_at`.

| Column | Type | Nullable | Default | Constraints / References |
|--------|------|----------|---------|--------------------------|
| `id` | uuid | FALSE | `gen_random_uuid()` | Primary Key |
| `club_id` | uuid | TRUE | | FK to `clubs(id)`. Null means District Event. |
| `title` | varchar(255) | FALSE | | |
| `slug` | varchar(255) | FALSE | | Unique Constraint |
| `description`| text | FALSE | | |
| `start_time` | timestamptz| FALSE | | Indexed (for queries) |
| `end_time` | timestamptz| FALSE | | |
| `venue` | varchar(255) | TRUE | | |
| `status` | event_status | FALSE | 'DRAFT' | ENUM: DRAFT, PUBLISHED, CANCELLED |
| `capacity` | integer | TRUE | | |

### 5. `registrations`
* **Purpose:** Links a member to an event.
* **Estimated Growth:** 50,000+ rows/year.
* **Soft Delete:** No (Uses `status` = 'CANCELLED' instead for audit).
* **Audit Fields:** `created_at`, `updated_at`.

| Column | Type | Nullable | Default | Constraints / References |
|--------|------|----------|---------|--------------------------|
| `id` | uuid | FALSE | `gen_random_uuid()` | Primary Key |
| `event_id` | uuid | FALSE | | FK to `events(id)` |
| `member_id` | uuid | FALSE | | FK to `member_profiles(id)` |
| `status` | reg_status | FALSE | 'PENDING' | ENUM: PENDING, CONFIRMED, CANCELLED |
| `qr_code_val`| varchar(255) | TRUE | | Unique Constraint |

*(Note: `UNIQUE(event_id, member_id)` ensures a user registers only once per event).*

### 6. `payment_transactions`
* **Purpose:** Financial ledger for tracking all payments (Razorpay).
* **Estimated Growth:** 30,000+ rows/year.
* **Soft Delete:** Strictly No (Financial Audit compliance).
* **Audit Fields:** `created_at`, `updated_at`.

| Column | Type | Nullable | Default | Constraints / References |
|--------|------|----------|---------|--------------------------|
| `id` | uuid | FALSE | `gen_random_uuid()` | Primary Key |
| `registration_id`| uuid| TRUE | | FK to `registrations(id)` (Nullable for donations) |
| `amount` | numeric(10,2)| FALSE | | |
| `currency` | varchar(3) | FALSE | 'INR' | |
| `pg_order_id`| varchar(255) | TRUE | | Razorpay Order ID |
| `pg_payment_id`| varchar(255)| TRUE | | Razorpay Payment ID |
| `status` | payment_status| FALSE| 'PENDING' | ENUM: PENDING, SUCCESS, FAILED, REFUNDED |
| `receipt_url`| text | TRUE | | |

### 7. `point_ledgers`
* **Purpose:** Append-only log of points awarded for gamification.
* **Estimated Growth:** 200,000+ rows/year.
* **Soft Delete:** No (Append-only).
* **Audit Fields:** `created_at`.

| Column | Type | Nullable | Default | Constraints / References |
|--------|------|----------|---------|--------------------------|
| `id` | uuid | FALSE | `gen_random_uuid()` | Primary Key |
| `member_id` | uuid | FALSE | | FK to `member_profiles(id)` |
| `event_id` | uuid | TRUE | | FK to `events(id)` |
| `points` | integer | FALSE | | Can be negative for penalties |
| `reason` | varchar(255) | FALSE | | |
| `awarded_by` | uuid | TRUE | | FK to `member_profiles(id)` (Admin) |

### 8. `meeting_minutes` (MOMs)
* **Purpose:** Stores audio recordings and meeting transcripts.
* **Estimated Growth:** 5,000+ rows/year.
* **Soft Delete:** Yes (`deleted_at`).
* **Audit Fields:** `created_at`, `updated_at`.

| Column | Type | Nullable | Default | Constraints / References |
|--------|------|----------|---------|--------------------------|
| `id` | uuid | FALSE | `gen_random_uuid()` | Primary Key |
| `club_id` | uuid | FALSE | | FK to `clubs(id)` |
| `meeting_date`| date | FALSE | | |
| `audio_url` | text | TRUE | | |
| `transcript` | text | TRUE | | |

---

## Indexing Strategy

To maintain sub-second query performance at scale:
1. **Primary Keys:** Auto-indexed by PostgreSQL (B-Tree).
2. **Foreign Keys:** Explicit B-Tree indexes created on all high-traffic foreign keys (e.g., `event_id` in `registrations`).
3. **Lookup Fields:** B-Tree indexes on `email`, `slug`, and `auth_id`.
4. **Time-Series Queries:** B-Tree indexes on `start_time` (Events) and `created_at` (PointLedgers) to optimize "Upcoming Events" and "Recent Points" queries.
5. **Partial Indexes:** Used for soft deletes. Example: 
   `CREATE INDEX idx_active_clubs ON clubs(id) WHERE deleted_at IS NULL;`

---

## Partitioning Strategy

As the ecosystem scales across multiple Rotary Years, the `point_ledgers`, `attendance_records`, and `payment_transactions` tables will accumulate massive row counts.
* **Strategy:** PostgreSQL **List Partitioning** by `rotary_year` (e.g., July 1st to June 30th). 
* **Benefit:** When a Rotary Year ends, the historical data partition can be moved to cheaper storage or quickly excluded from hot queries without massive `WHERE` clauses.

---

## Migration & Versioning Strategy

* **Tooling:** Supabase Migrations CLI (or standard Knex/Prisma migrations).
* **Immutability:** Once a migration script is merged and applied to production, it is **never** edited. Changes require a new, timestamped migration file (e.g., `20260701120000_add_blood_group_to_members.sql`).
* **Zero Downtime:** Schema changes that lock tables (e.g., adding a column with a default value across millions of rows) must be broken into multi-step concurrent operations.

---

## Database Scalability

1. **Connection Pooling:** Utilizing PgBouncer (native to Supabase) to manage thousands of serverless backend connections without exhausting DB memory.
2. **Read Replicas:** The system is designed to route heavy reads (e.g., the Public Showcase viewing Club Pages and Leaderboards) to a Read Replica, keeping the Primary DB free for write operations (Payments, Registrations).
3. **Materialised Views:** The Leaderboard is a `MATERIALIZED VIEW` over the `point_ledgers` table. It is refreshed asynchronously via a cron job every 5 minutes during peak times, preventing the complex `SUM()` query from choking the database on every page load.

---
*This document defines the physical Database tables and constraints. Proceed to L7 for Role-Based Access Control (RBAC) Permissions mapping.*
