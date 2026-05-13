CREATE TABLE IF NOT EXISTS leaderboard_cache (
  user_id uuid PRIMARY KEY,
  username text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_points ON leaderboard_cache (points DESC);
