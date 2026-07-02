-- 002_relationships.sql
-- Safely adds all foreign key relationships between the tables.
-- Uses DROP CONSTRAINT IF EXISTS before adding to ensure idempotency.

-- 2. clubs
ALTER TABLE clubs DROP CONSTRAINT IF EXISTS fk_clubs_district;
ALTER TABLE clubs ADD CONSTRAINT fk_clubs_district FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE RESTRICT;

-- 3. member_profiles
ALTER TABLE member_profiles DROP CONSTRAINT IF EXISTS fk_member_profiles_club;
ALTER TABLE member_profiles ADD CONSTRAINT fk_member_profiles_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL;

-- 4. member_roles
ALTER TABLE member_roles DROP CONSTRAINT IF EXISTS fk_member_roles_member;
ALTER TABLE member_roles DROP CONSTRAINT IF EXISTS fk_member_roles_club;
ALTER TABLE member_roles ADD CONSTRAINT fk_member_roles_member FOREIGN KEY (member_id) REFERENCES member_profiles(id) ON DELETE CASCADE;
ALTER TABLE member_roles ADD CONSTRAINT fk_member_roles_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

-- 5. activities
ALTER TABLE activities DROP CONSTRAINT IF EXISTS fk_activities_club;
ALTER TABLE activities ADD CONSTRAINT fk_activities_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

-- 6. registrations
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS fk_registrations_activity;
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS fk_registrations_member;
ALTER TABLE registrations ADD CONSTRAINT fk_registrations_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE;
ALTER TABLE registrations ADD CONSTRAINT fk_registrations_member FOREIGN KEY (member_id) REFERENCES member_profiles(id) ON DELETE CASCADE;

-- 7. meetings
ALTER TABLE meetings DROP CONSTRAINT IF EXISTS fk_meetings_club;
ALTER TABLE meetings ADD CONSTRAINT fk_meetings_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

-- 8. orientations
ALTER TABLE orientations DROP CONSTRAINT IF EXISTS fk_orientations_club;
ALTER TABLE orientations ADD CONSTRAINT fk_orientations_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;

-- 9. installations
ALTER TABLE installations DROP CONSTRAINT IF EXISTS fk_installations_club;
ALTER TABLE installations DROP CONSTRAINT IF EXISTS fk_installations_incoming_president;
ALTER TABLE installations ADD CONSTRAINT fk_installations_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;
ALTER TABLE installations ADD CONSTRAINT fk_installations_incoming_president FOREIGN KEY (incoming_president_id) REFERENCES member_profiles(id) ON DELETE RESTRICT;

-- 10. dovs
ALTER TABLE dovs DROP CONSTRAINT IF EXISTS fk_dovs_club;
ALTER TABLE dovs DROP CONSTRAINT IF EXISTS fk_dovs_visiting_official;
ALTER TABLE dovs ADD CONSTRAINT fk_dovs_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;
ALTER TABLE dovs ADD CONSTRAINT fk_dovs_visiting_official FOREIGN KEY (visiting_official_id) REFERENCES member_profiles(id) ON DELETE RESTRICT;

-- 11. point_ledgers
ALTER TABLE point_ledgers DROP CONSTRAINT IF EXISTS fk_point_ledgers_club;
ALTER TABLE point_ledgers DROP CONSTRAINT IF EXISTS fk_point_ledgers_member;
ALTER TABLE point_ledgers ADD CONSTRAINT fk_point_ledgers_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;
ALTER TABLE point_ledgers ADD CONSTRAINT fk_point_ledgers_member FOREIGN KEY (member_id) REFERENCES member_profiles(id) ON DELETE CASCADE;

-- 12. notifications
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS fk_notifications_recipient;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_id) REFERENCES member_profiles(id) ON DELETE CASCADE;

-- 13. analytics_events
ALTER TABLE analytics_events DROP CONSTRAINT IF EXISTS fk_analytics_events_user;
ALTER TABLE analytics_events ADD CONSTRAINT fk_analytics_events_user FOREIGN KEY (user_id) REFERENCES member_profiles(id) ON DELETE SET NULL;

-- 14. audit_logs
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS fk_audit_logs_actor;
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES member_profiles(id) ON DELETE SET NULL;

-- 15. showcase_features
ALTER TABLE showcase_features DROP CONSTRAINT IF EXISTS fk_showcase_features_activity;
ALTER TABLE showcase_features ADD CONSTRAINT fk_showcase_features_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE;

-- 16. club_website_configs
ALTER TABLE club_website_configs DROP CONSTRAINT IF EXISTS fk_club_website_configs_club;
ALTER TABLE club_website_configs ADD CONSTRAINT fk_club_website_configs_club FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE;
