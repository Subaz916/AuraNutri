-- =============================================================================
-- AuraNutri — Supabase PostgreSQL Schema
-- Run this entire file in your Supabase SQL Editor (Dashboard → SQL Editor)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLE: user_profile
-- Stores one row per user: their nutritional goals and body metrics.
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_profile (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        TEXT NOT NULL UNIQUE,   -- anonymous device ID or Supabase auth UID
  version        TEXT NOT NULL DEFAULT '1.0',

  -- Nutritional Goals
  goal_kcal      INTEGER NOT NULL DEFAULT 2000,
  goal_protein   INTEGER NOT NULL DEFAULT 150,
  goal_carbs     INTEGER NOT NULL DEFAULT 200,
  goal_fat       INTEGER NOT NULL DEFAULT 65,

  -- Body Metrics
  weight         NUMERIC(6,2) NOT NULL DEFAULT 75.0,
  target_weight  NUMERIC(6,2) NOT NULL DEFAULT 68.0,
  height         INTEGER NOT NULL DEFAULT 175,
  age            INTEGER NOT NULL DEFAULT 28,
  gender         TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female', 'other')),
  activity       TEXT NOT NULL DEFAULT 'moderate'
                   CHECK (activity IN ('sedentary','light','moderate','active','extreme')),

  -- App Settings
  theme              TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  accent_color       TEXT NOT NULL DEFAULT '#3B82F6',
  animations_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  compact_mode       BOOLEAN NOT NULL DEFAULT FALSE,
  backup_reminder    BOOLEAN NOT NULL DEFAULT TRUE,
  custom_units       JSONB NOT NULL DEFAULT '[]'::JSONB,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profile_updated_at
  BEFORE UPDATE ON user_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- TABLE: quick_foods
-- Stores the user's food database (custom + starter foods).
-- =============================================================================
CREATE TABLE IF NOT EXISTS quick_foods (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          TEXT NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,

  name             TEXT NOT NULL,
  default_quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit             TEXT NOT NULL DEFAULT 'piece',
  calories         INTEGER NOT NULL DEFAULT 0,
  protein          NUMERIC(8,2) NOT NULL DEFAULT 0,
  carbs            NUMERIC(8,2) NOT NULL DEFAULT 0,
  fat              NUMERIC(8,2) NOT NULL DEFAULT 0,
  category         TEXT NOT NULL DEFAULT 'Snacks',
  icon             TEXT NOT NULL DEFAULT '🥗',
  favorite         BOOLEAN NOT NULL DEFAULT FALSE,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_quick_foods_updated_at
  BEFORE UPDATE ON quick_foods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_quick_foods_user_id ON quick_foods(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_foods_category ON quick_foods(category);
CREATE INDEX IF NOT EXISTS idx_quick_foods_favorite ON quick_foods(user_id, favorite) WHERE favorite = TRUE;

-- =============================================================================
-- TABLE: daily_records
-- One row per user per calendar date. Stores daily water and weight.
-- =============================================================================
CREATE TABLE IF NOT EXISTS daily_records (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    TEXT NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  log_date   DATE NOT NULL,

  water_ml   INTEGER NOT NULL DEFAULT 0,
  weight_kg  NUMERIC(6,2),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, log_date)
);

CREATE TRIGGER trg_daily_records_updated_at
  BEFORE UPDATE ON daily_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_daily_records_user_date ON daily_records(user_id, log_date DESC);

-- =============================================================================
-- TABLE: food_log_entries
-- Each individual food item logged for a given date.
-- =============================================================================
CREATE TABLE IF NOT EXISTS food_log_entries (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      TEXT NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  log_date     DATE NOT NULL,

  name         TEXT NOT NULL,
  quantity     NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit         TEXT NOT NULL DEFAULT 'piece',
  calories     INTEGER NOT NULL DEFAULT 0,
  protein      NUMERIC(8,2) NOT NULL DEFAULT 0,
  carbs        NUMERIC(8,2) NOT NULL DEFAULT 0,
  fat          NUMERIC(8,2) NOT NULL DEFAULT 0,
  category     TEXT NOT NULL DEFAULT 'Snacks',
  log_time     TEXT NOT NULL DEFAULT '12:00',   -- HH:MM string
  notes        TEXT NOT NULL DEFAULT '',

  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_food_log_updated_at
  BEFORE UPDATE ON food_log_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_food_log_user_date ON food_log_entries(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_food_log_category   ON food_log_entries(user_id, category);

-- =============================================================================
-- VIEWS: helpful aggregations
-- =============================================================================

-- Daily macro totals per user per date
CREATE OR REPLACE VIEW daily_macro_totals AS
SELECT
  user_id,
  log_date,
  SUM(calories) AS total_calories,
  SUM(protein)  AS total_protein,
  SUM(carbs)    AS total_carbs,
  SUM(fat)      AS total_fat,
  COUNT(*)      AS food_count
FROM food_log_entries
GROUP BY user_id, log_date;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only see and modify their own rows.
-- Disable / enable depending on whether you use Supabase Auth.
-- When using anonymous device IDs (no Auth), keep RLS disabled for simplicity.
-- =============================================================================

-- To ENABLE strict RLS with Supabase Auth (recommended for production):
-- ALTER TABLE user_profile     ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE quick_foods      ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_records    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE food_log_entries ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "users_own_profile" ON user_profile
--   FOR ALL USING (user_id = auth.uid()::TEXT);
-- CREATE POLICY "users_own_foods"   ON quick_foods
--   FOR ALL USING (user_id = auth.uid()::TEXT);
-- CREATE POLICY "users_own_records" ON daily_records
--   FOR ALL USING (user_id = auth.uid()::TEXT);
-- CREATE POLICY "users_own_logs"    ON food_log_entries
--   FOR ALL USING (user_id = auth.uid()::TEXT);

-- =============================================================================
-- TABLE: login_attempts
-- Stores history of login attempts, including security snapshots.
-- =============================================================================
CREATE TABLE IF NOT EXISTS login_attempts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success           BOOLEAN NOT NULL,
  image_url         TEXT, -- Base64 data URL for camera snapshot
  browser           TEXT,
  operating_system  TEXT,
  screen_resolution TEXT,
  timezone          TEXT,
  ip_address        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: Enable public inserts so anonymous login snapshots can be logged before fully authenticated
-- ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "allow_anonymous_inserts" ON login_attempts FOR INSERT WITH CHECK (true);

-- =============================================================================
-- Done! Copy your Supabase Project URL and anon key into supabase.js
-- =============================================================================

