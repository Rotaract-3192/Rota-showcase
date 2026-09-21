-- Club bulletins submitted from the portal for district review
CREATE TABLE IF NOT EXISTS public.club_bulletins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES public.clubs(id),
  title text NOT NULL,
  edition text,
  file_url text,
  submitted_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
