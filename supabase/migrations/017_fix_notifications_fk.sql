-- Drop policies first because they depend on the column
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications ALTER COLUMN user_id TYPE VARCHAR(255);
-- Rename user_id to auth_id for clarity
ALTER TABLE notifications RENAME COLUMN user_id TO auth_id;

-- Recreate the RLS policies to use auth_id
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid()::text = auth_id OR auth_id = current_setting('request.jwt.claims', true)::json->>'sub');

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid()::text = auth_id OR auth_id = current_setting('request.jwt.claims', true)::json->>'sub');
