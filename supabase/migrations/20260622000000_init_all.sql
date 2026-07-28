-- ============================================================================
-- Supabase Core Database Initialization
-- Migration: 20260622000000_init_all.sql
-- Description: Sets up extensions, core tables, security policies (RLS),
--              realtime configuration, helper functions, and storage buckets.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Extensions
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ----------------------------------------------------------------------------
-- 2. Tables & Indexes
-- ----------------------------------------------------------------------------

-- Players Table
CREATE TABLE IF NOT EXISTS public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_players_name_lower 
    ON public.players (LOWER(name));

-- Application Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    key VARCHAR(255) PRIMARY KEY,
    value VARCHAR(255) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. Seed Default Data
-- ----------------------------------------------------------------------------
INSERT INTO public.settings (key, value)
VALUES
    ('unlimited_rounds', 'false'),
    ('maintenance_mode', 'false'),
    ('max_players', '8')
ON CONFLICT (key) DO UPDATE 
    SET value = EXCLUDED.value;

-- ----------------------------------------------------------------------------
-- 4. Row Level Security (RLS) & Table Privileges
-- ----------------------------------------------------------------------------
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Grant permissions on players table
GRANT SELECT, INSERT ON public.players TO anon, authenticated;
GRANT ALL ON public.players TO authenticated, service_role;

-- Grant permissions on settings table
GRANT SELECT ON public.settings TO anon, authenticated;
GRANT ALL ON public.settings TO authenticated, service_role;

-- Drop existing policies for idempotent execution
DROP POLICY IF EXISTS "Allow public select on players" ON public.players;
DROP POLICY IF EXISTS "Allow public insert on players" ON public.players;
DROP POLICY IF EXISTS "Allow admin update/delete on players" ON public.players;

-- Security Policies for public.players
CREATE POLICY "Allow public select on players" 
    ON public.players FOR SELECT 
    TO anon 
    USING (true);

CREATE POLICY "Allow public insert on players" 
    ON public.players FOR INSERT 
    TO anon 
    WITH CHECK (name IS NOT NULL AND length(trim(name)) > 0);

CREATE POLICY "Allow admin update/delete on players" 
    ON public.players FOR ALL 
    TO authenticated 
    USING ((SELECT auth.jwt()) ->> 'email' = 'riskicahyadi.2nd@gmail.com') 
    WITH CHECK ((SELECT auth.jwt()) ->> 'email' = 'riskicahyadi.2nd@gmail.com');

-- Drop existing policies for settings
DROP POLICY IF EXISTS "Allow public select on settings" ON public.settings;
DROP POLICY IF EXISTS "Allow admin write on settings" ON public.settings;

-- Security Policies for public.settings
CREATE POLICY "Allow public select on settings" 
    ON public.settings FOR SELECT 
    TO anon 
    USING (true);

CREATE POLICY "Allow admin write on settings" 
    ON public.settings FOR ALL 
    TO authenticated 
    USING ((SELECT auth.jwt()) ->> 'email' = 'riskicahyadi.2nd@gmail.com') 
    WITH CHECK ((SELECT auth.jwt()) ->> 'email' = 'riskicahyadi.2nd@gmail.com');

-- ----------------------------------------------------------------------------
-- 5. Realtime Publication Setup
-- ----------------------------------------------------------------------------
BEGIN;
    DROP PUBLICATION IF EXISTS supabase_realtime;
    CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;

-- ----------------------------------------------------------------------------
-- 6. Functions & Security Hooks
-- ----------------------------------------------------------------------------

-- Simple health check function
CREATE OR REPLACE FUNCTION public.ping()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    RETURN 'success';
END;
$$;

-- System metrics inspection function
CREATE OR REPLACE FUNCTION public.get_system_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
    v_version text;
    v_rls_enabled boolean;
    v_settings_active boolean;
    v_timezone text;
BEGIN
    SELECT version() INTO v_version;

    SELECT COALESCE(bool_and(rowsecurity), false)
    INTO v_rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN ('players', 'settings');

    BEGIN
        PERFORM count(*) FROM public.settings;
        v_settings_active := true;
    EXCEPTION
        WHEN OTHERS THEN
            v_settings_active := false;
    END;

    SELECT current_setting('timezone') INTO v_timezone;

    RETURN json_build_object(
        'db_version', v_version,
        'rls_enabled', v_rls_enabled,
        'settings_active', v_settings_active,
        'timezone', v_timezone
    );
END;
$$;

-- Function to restrict auth user access/modification
CREATE OR REPLACE FUNCTION public.restrict_auth_users_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth', 'pg_catalog'
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        IF OLD.email = 'riskicahyadi.2nd@gmail.com' THEN
            RETURN OLD;
        END IF;
        RAISE EXCEPTION 'Penghapusan akun admin dinonaktifkan!';
    END IF;

    -- For INSERT and UPDATE
    IF NEW.email = 'riskicahyadi.2nd@gmail.com' THEN
        RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Registrasi dan modifikasi akun baru dinonaktifkan!';
END;
$$;

-- Revoke function execution privileges from public roles
REVOKE EXECUTE ON FUNCTION public.restrict_auth_users_access() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.restrict_auth_users_access() FROM anon;
REVOKE EXECUTE ON FUNCTION public.restrict_auth_users_access() FROM authenticated;

-- Function hook to restrict email registrations
CREATE OR REPLACE FUNCTION public.cek_email_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
    IF event->'user'->>'email' <> 'riskicahyadi.2nd@gmail.com' THEN
        RETURN jsonb_build_object(
            'error', jsonb_build_object(
                'http_code', 403,
                'message', 'Akses ditolak. Registrasi tidak diizinkan.'
            )
        );
    END IF;
    RETURN '{}'::jsonb;
END;
$$;

-- Revoke execution permissions from public roles
REVOKE EXECUTE ON FUNCTION public.cek_email_hook(jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cek_email_hook(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.cek_email_hook(jsonb) FROM authenticated;

-- Grant execution permission specifically to Supabase Auth Admin
GRANT EXECUTE ON FUNCTION public.cek_email_hook(jsonb) TO supabase_auth_admin;

-- Security trigger on auth.users table
DROP TRIGGER IF EXISTS auth_users_security_trigger ON auth.users;
CREATE TRIGGER auth_users_security_trigger
    BEFORE INSERT OR UPDATE OR DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.restrict_auth_users_access();

-- ----------------------------------------------------------------------------
-- 7. Storage Bucket & Policies Configuration
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-reports', 'game-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin all on storage" ON storage.objects;

-- Storage Security Policies
CREATE POLICY "Allow public upload" 
    ON storage.objects FOR INSERT 
    TO anon 
    WITH CHECK (bucket_id = 'game-reports');

CREATE POLICY "Allow admin all on storage" 
    ON storage.objects FOR ALL 
    TO authenticated 
    USING (
        bucket_id = 'game-reports' AND 
        ((SELECT auth.jwt()) ->> 'email' = 'riskicahyadi.2nd@gmail.com')
    ) 
    WITH CHECK (
        bucket_id = 'game-reports' AND 
        ((SELECT auth.jwt()) ->> 'email' = 'riskicahyadi.2nd@gmail.com')
    );