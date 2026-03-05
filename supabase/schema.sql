-- ============================
-- THE CONSTRUCT — DATABASE SCHEMA
-- ============================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================
-- USERS TABLE
-- ============================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  designation TEXT NOT NULL UNIQUE,
  faction TEXT NOT NULL CHECK (faction IN ('TECHNOCRATS', 'KEEPERS_OF_THE_VEIL', 'IRONBORN_COLLECTIVE')),
  rank TEXT NOT NULL DEFAULT 'INITIATE' CHECK (rank IN ('INITIATE', 'OPERATIVE', 'SPECIALIST', 'SENTINEL', 'WARDEN', 'COMMANDER', 'OVERLORD', 'SOVEREIGN')),
  prestige INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  xp_to_next_rank INTEGER NOT NULL DEFAULT 500,
  level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  current_sector INTEGER NOT NULL DEFAULT 1,
  
  -- Skills (0-100 each)
  skill_hacking INTEGER NOT NULL DEFAULT 10,
  skill_combat INTEGER NOT NULL DEFAULT 10,
  skill_diplomacy INTEGER NOT NULL DEFAULT 10,
  skill_survival INTEGER NOT NULL DEFAULT 10,
  skill_arcana INTEGER NOT NULL DEFAULT 10,
  skill_engineering INTEGER NOT NULL DEFAULT 10,
  
  -- Elements
  primary_element TEXT NOT NULL DEFAULT 'LIGHTNING',
  secondary_element TEXT,
  
  -- Alignment
  alignment TEXT NOT NULL DEFAULT 'TRUE_NEUTRAL',
  
  -- Profile
  backstory TEXT DEFAULT '',
  personal_motto TEXT DEFAULT '',
  theme_song TEXT DEFAULT '',
  avatar_data_url TEXT,
  privacy_level TEXT NOT NULL DEFAULT 'public' CHECK (privacy_level IN ('public', 'faction_only', 'private')),
  
  -- Settings
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  scanline_intensity INTEGER NOT NULL DEFAULT 70,
  crt_flicker BOOLEAN NOT NULL DEFAULT true,
  text_speed INTEGER NOT NULL DEFAULT 30,
  theme_intensity TEXT NOT NULL DEFAULT 'balanced' CHECK (theme_intensity IN ('subtle', 'balanced', 'maximum')),
  
  -- Metadata
  titles TEXT[] DEFAULT ARRAY[]::TEXT[],
  strengths TEXT[] DEFAULT ARRAY[]::TEXT[],
  weaknesses TEXT[] DEFAULT ARRAY[]::TEXT[],
  allies TEXT[] DEFAULT ARRAY[]::TEXT[],
  enemies TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_messages INTEGER NOT NULL DEFAULT 0,
  total_quests_completed INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for leaderboard queries
CREATE INDEX idx_users_prestige ON users(prestige DESC);
CREATE INDEX idx_users_faction ON users(faction);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- ============================
-- MESSAGES TABLE
-- ============================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('SYSTEM', 'ARCHITECT', 'AI_DM', 'NPC', 'ANOMALY')),
  content TEXT NOT NULL,
  choices JSONB DEFAULT '[]',
  stat_changes JSONB DEFAULT '[]',
  is_glitch BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_user_id ON messages(user_id, created_at DESC);

-- ============================
-- EQUIPMENT TABLE
-- ============================
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('WEAPON', 'ARMOR', 'ACCESSORY', 'COMPANION', 'IMPLANT', 'RELIC')),
  rarity TEXT NOT NULL DEFAULT 'COMMON' CHECK (rarity IN ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY')),
  description TEXT NOT NULL DEFAULT '',
  stats JSONB DEFAULT '{}',
  lore TEXT DEFAULT '',
  source TEXT DEFAULT '',
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_equipment_user_id ON equipment(user_id);

-- ============================
-- ABILITIES TABLE
-- ============================
CREATE TABLE abilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ability_id TEXT NOT NULL,  -- matches the constant ability ID
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('OFFENSIVE', 'DEFENSIVE', 'UTILITY', 'PASSIVE')),
  description TEXT NOT NULL,
  level_required INTEGER NOT NULL DEFAULT 1,
  cooldown TEXT DEFAULT 'None',
  cost TEXT DEFAULT 'Passive',
  effect TEXT NOT NULL,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  
  UNIQUE(user_id, ability_id)
);

CREATE INDEX idx_abilities_user_id ON abilities(user_id);

-- ============================
-- QUESTS TABLE
-- ============================
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('STORY_ARC', 'DAILY_CONTRACT', 'WEEKLY_BOUNTY', 'ANOMALY_EVENT')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (difficulty IN ('TRIVIAL', 'EASY', 'MEDIUM', 'HARD', 'LEGENDARY')),
  sector INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'FAILED', 'EXPIRED')),
  current_stage INTEGER NOT NULL DEFAULT 0,
  total_stages INTEGER NOT NULL DEFAULT 3,
  rewards JSONB DEFAULT '[]',
  narrative JSONB DEFAULT '[]',
  choices JSONB DEFAULT '[]',
  quest_giver JSONB DEFAULT '{}',
  npcs_involved JSONB DEFAULT '[]',
  branches JSONB DEFAULT '[]',
  alignment_shift JSONB DEFAULT '{}',
  stage_viewed JSONB DEFAULT '[]',
  is_chain_quest BOOLEAN NOT NULL DEFAULT false,
  chain_id UUID,
  chain_position INTEGER,
  fail_consequence TEXT,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quests_user_id ON quests(user_id, status);

-- ============================
-- MEMORY LOG TABLE
-- ============================
CREATE TABLE memory_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quest', 'combat', 'discovery', 'social', 'achievement')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_memory_log_user_id ON memory_log(user_id, created_at DESC);

-- ============================
-- FACTIONS TABLE
-- ============================
CREATE TABLE factions (
  id TEXT PRIMARY KEY CHECK (id IN ('TECHNOCRATS', 'KEEPERS_OF_THE_VEIL', 'IRONBORN_COLLECTIVE')),
  total_power INTEGER NOT NULL DEFAULT 0,
  sectors_controlled INTEGER NOT NULL DEFAULT 0,
  member_count INTEGER NOT NULL DEFAULT 0,
  weekly_change INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed faction data
INSERT INTO factions (id, total_power, sectors_controlled, member_count) VALUES
  ('TECHNOCRATS', 1000, 18, 0),
  ('KEEPERS_OF_THE_VEIL', 800, 15, 0),
  ('IRONBORN_COLLECTIVE', 700, 12, 0);

-- ============================
-- SECTORS TABLE
-- ============================
CREATE TABLE sectors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  controlled_by TEXT REFERENCES factions(id),
  threat_level INTEGER NOT NULL DEFAULT 1 CHECK (threat_level BETWEEN 1 AND 10),
  terrain TEXT NOT NULL DEFAULT 'urban',
  weather TEXT NOT NULL DEFAULT 'clear',
  description TEXT DEFAULT '',
  resources TEXT[] DEFAULT ARRAY[]::TEXT[],
  npcs_present TEXT[] DEFAULT ARRAY[]::TEXT[],
  discovered_by UUID[] DEFAULT ARRAY[]::UUID[],
  active_events TEXT[] DEFAULT ARRAY[]::TEXT[],
  adjacent_sectors INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  points_of_interest JSONB DEFAULT '[]',
  last_contested_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================
-- LEADERBOARD VIEW (auto-computed)
-- ============================
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  ROW_NUMBER() OVER (ORDER BY prestige DESC) as position,
  id,
  designation,
  faction,
  rank,
  prestige,
  level,
  total_quests_completed,
  last_active_at
FROM users
ORDER BY prestige DESC
LIMIT 100;

-- ============================
-- CHAT CHANNELS TABLE (for faction hub)
-- ============================
CREATE TABLE chat_channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('general', 'combat', 'roleplay', 'announcements', 'whisper')),
  description TEXT DEFAULT '',
  faction TEXT,  -- NULL means global
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default channels
INSERT INTO chat_channels (id, name, type, description, faction) VALUES
  ('global-general', '# GLOBAL COMMS', 'general', 'Open channel — all factions.', NULL),
  ('global-combat', '# COMBAT ARENA', 'combat', 'Challenge other Architects.', NULL);

-- ============================
-- CHANNEL MESSAGES TABLE
-- ============================
CREATE TABLE channel_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id TEXT NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  designation TEXT NOT NULL,
  faction TEXT NOT NULL,
  rank TEXT NOT NULL DEFAULT 'INITIATE',
  content TEXT NOT NULL,
  reactions JSONB DEFAULT '{}',
  reply_to UUID REFERENCES channel_messages(id),
  is_npc BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_channel_messages_channel ON channel_messages(channel_id, created_at DESC);

-- ============================
-- COMBAT SESSIONS TABLE
-- ============================
CREATE TABLE combat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id TEXT NOT NULL REFERENCES chat_channels(id),
  status TEXT NOT NULL DEFAULT 'SETUP' CHECK (status IN ('SETUP', 'ACTIVE', 'JUDGING', 'COMPLETE')),
  participants JSONB NOT NULL DEFAULT '[]',
  rounds JSONB NOT NULL DEFAULT '[]',
  current_round INTEGER NOT NULL DEFAULT 0,
  max_rounds INTEGER NOT NULL DEFAULT 5,
  environment TEXT DEFAULT '',
  environment_modifiers TEXT[] DEFAULT ARRAY[]::TEXT[],
  ai_judge_enabled BOOLEAN NOT NULL DEFAULT true,
  winner_id UUID REFERENCES users(id),
  rewards JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================
-- WAR HISTORY TABLE
-- ============================
CREATE TABLE war_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_start TIMESTAMPTZ NOT NULL,
  cycle_end TIMESTAMPTZ NOT NULL,
  winner TEXT REFERENCES factions(id),
  technocrat_score INTEGER NOT NULL DEFAULT 0,
  keepers_score INTEGER NOT NULL DEFAULT 0,
  ironborn_score INTEGER NOT NULL DEFAULT 0,
  total_participants INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================
-- ROW LEVEL SECURITY
-- ============================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE abilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE combat_sessions ENABLE ROW LEVEL SECURITY;

-- Users: can read all public profiles, can only update own
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- Messages: users can only see their own messages
CREATE POLICY "Users see own messages" ON messages FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "Users insert own messages" ON messages FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- Equipment: users see and manage their own
CREATE POLICY "Users manage own equipment" ON equipment FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- Abilities: users see and manage their own
CREATE POLICY "Users manage own abilities" ON abilities FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- Quests: users see and manage their own
CREATE POLICY "Users manage own quests" ON quests FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- Memory log: users see their own
CREATE POLICY "Users see own memory log" ON memory_log FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- Channel messages: everyone can read, authenticated can insert
CREATE POLICY "Anyone can read channel messages" ON channel_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post" ON channel_messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Factions and sectors: everyone can read
CREATE POLICY "Anyone can read factions" ON factions FOR SELECT USING (true);
CREATE POLICY "Anyone can read sectors" ON sectors FOR SELECT USING (true);

-- Combat: participants and spectators can read
CREATE POLICY "Anyone can read combat" ON combat_sessions FOR SELECT USING (true);
CREATE POLICY "Authenticated can create combat" ON combat_sessions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
