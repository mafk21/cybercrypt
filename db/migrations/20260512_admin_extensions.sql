-- Add admin and moderation fields for the platform.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false;

ALTER TABLE challenges
  ADD COLUMN IF NOT EXISTS tags text[];

CREATE TABLE IF NOT EXISTS admin_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO admin_settings (key, value)
VALUES
  ('submissions_locked', 'false'),
  ('announcement', '')
ON CONFLICT (key) DO NOTHING;
