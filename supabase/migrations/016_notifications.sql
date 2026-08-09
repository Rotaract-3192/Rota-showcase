DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id), -- Specific user recipient
  role_target VARCHAR, -- Role-based broadcast (e.g. 'DISTRICT_ADMIN', 'ZRR')
  title VARCHAR NOT NULL,
  message TEXT,
  link VARCHAR, -- Deep link when the notification is clicked
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Allow admins to view all notifications for debugging
CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM member_roles mr
      JOIN member_profiles mp ON mr.member_id = mp.id
      WHERE mp.auth_id = auth.uid()::text
      AND mr.role IN ('SUPER_ADMIN', 'DISTRICT_ADMIN')
    )
  );

-- Allow authenticated users to update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- We'll create notifications via the service role key, so no insert policy is needed for normal users,
-- but we'll add one just in case we need client-side creation.
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS anyway, but for completeness.
