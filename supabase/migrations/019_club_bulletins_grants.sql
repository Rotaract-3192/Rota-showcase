-- Ensure club bulletins are writable/readable by the API role used by the portal
GRANT SELECT, INSERT, UPDATE ON TABLE public.club_bulletins TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.club_bulletins TO service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.club_bulletins TO anon;

-- Helpful if RLS was enabled without policies (service_role JWT still needs table grants)
ALTER TABLE public.club_bulletins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS club_bulletins_service_all ON public.club_bulletins;
CREATE POLICY club_bulletins_service_all
  ON public.club_bulletins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS club_bulletins_authenticated_insert ON public.club_bulletins;
CREATE POLICY club_bulletins_authenticated_insert
  ON public.club_bulletins
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS club_bulletins_authenticated_select ON public.club_bulletins;
CREATE POLICY club_bulletins_authenticated_select
  ON public.club_bulletins
  FOR SELECT
  TO authenticated
  USING (true);
