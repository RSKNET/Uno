-- Enable pgcrypto extension for password hashing if it isn't already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ==========================================
-- 1. Create Tables
-- ==========================================

-- Players Table
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Case-insensitive unique index for player names (PRD: check LOWER(name))
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_name_lower ON public.players (LOWER(name));

-- Games Table
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_players INTEGER NOT NULL,
    total_rounds INTEGER NOT NULL,
    is_unlimited_rounds BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Game Scores Table
CREATE TABLE IF NOT EXISTS public.game_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
    round_number INTEGER NOT NULL,
    rank INTEGER NOT NULL,
    calculated_score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_game_player_round UNIQUE (game_id, player_id, round_number)
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_game_scores_game_id ON public.game_scores(game_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_player_id ON public.game_scores(player_id);

-- Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    key VARCHAR(255) PRIMARY KEY,
    value VARCHAR(255) NOT NULL
);

-- ==========================================
-- 2. Seed Default Settings
-- ==========================================
INSERT INTO public.settings (key, value) VALUES
('unlimited_rounds', 'false'),
('maintenance_mode', 'false'),
('max_players', '8')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ==========================================
-- 3. Row Level Security (RLS) Configuration
-- ==========================================
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Grant privileges to anon and authenticated roles
GRANT SELECT, INSERT ON public.players TO anon, authenticated;
GRANT ALL ON public.players TO authenticated;

GRANT ALL ON public.games TO anon, authenticated;
GRANT ALL ON public.game_scores TO anon, authenticated;

GRANT SELECT ON public.settings TO anon, authenticated;
GRANT ALL ON public.settings TO authenticated;

-- Drop existing policies if any to avoid errors during reset
DROP POLICY IF EXISTS "Allow public select on players" ON public.players;
DROP POLICY IF EXISTS "Allow public insert on players" ON public.players;
DROP POLICY IF EXISTS "Allow admin update/delete on players" ON public.players;

DROP POLICY IF EXISTS "Allow public access on games" ON public.games;
DROP POLICY IF EXISTS "Allow public select on games" ON public.games;
DROP POLICY IF EXISTS "Allow public insert on games" ON public.games;
DROP POLICY IF EXISTS "Allow admin modify on games" ON public.games;

DROP POLICY IF EXISTS "Allow public access on game_scores" ON public.game_scores;
DROP POLICY IF EXISTS "Allow public select on game_scores" ON public.game_scores;
DROP POLICY IF EXISTS "Allow public insert on game_scores" ON public.game_scores;
DROP POLICY IF EXISTS "Allow admin modify on game_scores" ON public.game_scores;

DROP POLICY IF EXISTS "Allow public select on settings" ON public.settings;
DROP POLICY IF EXISTS "Allow admin write on settings" ON public.settings;

-- Policies for players
CREATE POLICY "Allow public select on players" ON public.players
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public insert on players" ON public.players
    FOR INSERT TO anon WITH CHECK (name IS NOT NULL AND length(trim(name)) > 0);

CREATE POLICY "Allow admin update/delete on players" ON public.players
    FOR ALL TO authenticated USING ((select auth.jwt()) ->> 'email' = 'admin@unoskors.com') WITH CHECK ((select auth.jwt()) ->> 'email' = 'admin@unoskors.com');

-- Policies for games
CREATE POLICY "Allow public select on games" ON public.games
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public insert on games" ON public.games
    FOR INSERT TO anon WITH CHECK (total_players >= 2 AND total_rounds >= 1);

CREATE POLICY "Allow admin modify on games" ON public.games
    FOR ALL TO authenticated USING ((select auth.jwt()) ->> 'email' = 'admin@unoskors.com') WITH CHECK ((select auth.jwt()) ->> 'email' = 'admin@unoskors.com');

-- Policies for game_scores
CREATE POLICY "Allow public select on game_scores" ON public.game_scores
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public insert on game_scores" ON public.game_scores
    FOR INSERT TO anon WITH CHECK (round_number >= 1 AND rank >= 1 AND calculated_score >= 0);

CREATE POLICY "Allow admin modify on game_scores" ON public.game_scores
    FOR ALL TO authenticated USING ((select auth.jwt()) ->> 'email' = 'admin@unoskors.com') WITH CHECK ((select auth.jwt()) ->> 'email' = 'admin@unoskors.com');

-- Policies for settings (anyone can view, admin updates)
CREATE POLICY "Allow public select on settings" ON public.settings
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow admin write on settings" ON public.settings
    FOR ALL TO authenticated USING ((select auth.jwt()) ->> 'email' = 'admin@unoskors.com') WITH CHECK ((select auth.jwt()) ->> 'email' = 'admin@unoskors.com');

-- ==========================================
-- 4. Enable Realtime Replication
-- ==========================================
-- Add settings table to the supabase_realtime publication for maintenance mode syncing
BEGIN;
    DROP PUBLICATION IF EXISTS supabase_realtime;
    CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;

-- ==========================================
-- 5. Seed Default Admin Auth User
-- ==========================================
-- Seed a default user admin@unoskors.com / password123
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'authenticated',
    'authenticated',
    'admin@unoskors.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin Uno"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Associate the identity so auth UI registers the provider
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    jsonb_build_object('sub', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'email', 'admin@unoskors.com', 'email_verified', true),
    'email',
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    NULL,
    now(),
    now()
) ON CONFLICT (provider_id, provider) DO NOTHING;

-- ==========================================
-- 6. Create Game Reports Storage Bucket
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-reports', 'game-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for game-reports bucket
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin all on storage" ON storage.objects;

CREATE POLICY "Allow public upload" ON storage.objects
    FOR INSERT TO anon WITH CHECK (bucket_id = 'game-reports');

CREATE POLICY "Allow admin all on storage" ON storage.objects
    FOR ALL TO authenticated USING (bucket_id = 'game-reports' AND ((select auth.jwt()) ->> 'email' = 'admin@unoskors.com')) WITH CHECK (bucket_id = 'game-reports' AND ((select auth.jwt()) ->> 'email' = 'admin@unoskors.com'));

-- ==========================================
-- 7. Utility Ping Function
-- ==========================================
CREATE OR REPLACE FUNCTION "public"."ping"() RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN 'success';
END;
$$;
