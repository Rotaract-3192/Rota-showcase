# Supabase Data Seeding

## Purpose
This folder stores seed SQL files containing reference data and placeholder test datasets for local development and testing environments. Seeds populate the initial state of the application without mutating the schema itself.

## Execution Order
Because tables have foreign key relationships (e.g., a `club` depends on a `district`, a `user` depends on a `club`), seed files MUST be executed in the correct dependency order.

### Required Sequence
1. **`district.sql`** (No dependencies)
2. **`areas_of_focus.sql`** / **`avenues_of_service.sql`** (Standalone lookups)
3. **`clubs.sql`** (Depends on `district.sql`)
4. **`roles.sql`** / **`permissions.sql`** (RBAC definitions)
5. **`users.sql`** (Depends on `clubs.sql` and `roles.sql`)
6. **`interests.sql`** (Depends on `users.sql`)

## Running Seeds
During local development with the Supabase CLI, you can pipe these files into your local database or configure `supabase/seed.sql` as an entry point that invokes these scripts in the correct order.

*Do not run development seeds against the production database.*
