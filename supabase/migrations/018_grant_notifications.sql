-- Grant privileges to the roles used by PostgREST
GRANT ALL ON TABLE notifications TO authenticated;
GRANT ALL ON TABLE notifications TO service_role;
GRANT ALL ON TABLE notifications TO anon;
