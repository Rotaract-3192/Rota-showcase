# Supabase Row Level Security (RLS) Policies

## Purpose
This folder stores the raw SQL policies that define Row Level Security for the database. These policies act as the ultimate security gatekeeper, intercepting every database query to ensure the requesting user is authorized to perform the action on the specific row.

## RLS Strategy
1. **Enable RLS Everywhere:** Every single table must have `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;` applied.
2. **Default Deny:** If no policy matches a query, PostgreSQL defaults to denying access.
3. **Targeted Files:** We split policies into separate files grouped by domain (e.g., `clubs.sql`, `users.sql`) rather than one massive file, to keep reviews manageable.
4. **Auth Context:** Use `auth.uid()` and custom claims via Clerk (when implemented) to rapidly validate permissions without complex joins.

## Examples Provided
- `clubs.sql`: Defines who can update club settings.
- `activities.sql`: Enforces that only club leaders can create events for their club.
- `users.sql`: Defines that members can read their own profiles, but Admins can read all.
- `meetings.sql`: Restricts MOM viewing based on club membership.
- `notifications.sql`: Controls access to user-specific inbox alerts.

*(Note: These files are for organizational and review purposes. They must eventually be included in standard migrations to be applied to the database).*
