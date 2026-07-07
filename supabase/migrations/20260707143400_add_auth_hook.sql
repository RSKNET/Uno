-- 1. Create function for auth hook to filter signups
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

-- Revoke execution from public roles for security
REVOKE EXECUTE ON FUNCTION public.cek_email_hook(jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cek_email_hook(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.cek_email_hook(jsonb) FROM authenticated;

-- Grant permissions only to auth admin
GRANT EXECUTE ON FUNCTION public.cek_email_hook(jsonb) TO supabase_auth_admin;

-- 2. Update restrict_auth_users_access function to allow the Google OAuth email
CREATE OR REPLACE FUNCTION public.restrict_auth_users_access()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public', 'auth', 'pg_catalog' AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.email = 'riskicahyadi.2nd@gmail.com' THEN
      RETURN OLD;
    END IF;
    RAISE EXCEPTION 'Penghapusan akun admin dinonaktifkan!';
  END IF;

  -- For INSERT and UPDATE, NEW is defined
  IF NEW.email = 'riskicahyadi.2nd@gmail.com' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.id = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' THEN RETURN NEW;
    ELSE RAISE EXCEPTION 'Registrasi akun baru dinonaktifkan di sistem ini!'; END IF;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.encrypted_password <> OLD.encrypted_password THEN RAISE EXCEPTION 'Perubahan kata sandi (reset password) dinonaktifkan!'; END IF;
    IF NEW.email <> OLD.email THEN RAISE EXCEPTION 'Perubahan alamat email dinonaktifkan!'; END IF;
    IF NEW.id <> OLD.id OR NEW.role <> OLD.role THEN RAISE EXCEPTION 'Modifikasi identitas akun dilarang!'; END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END; $$;

-- 3. Update RLS Policies to allow the Google OAuth email as Admin
DROP POLICY IF EXISTS "Allow admin update/delete on players" ON public.players;
CREATE POLICY "Allow admin update/delete on players" ON public.players FOR ALL TO authenticated USING ((select auth.jwt()) ->> 'email' IN ('admin@unoskors.com', 'riskicahyadi.2nd@gmail.com')) WITH CHECK ((select auth.jwt()) ->> 'email' IN ('admin@unoskors.com', 'riskicahyadi.2nd@gmail.com'));

DROP POLICY IF EXISTS "Allow admin write on settings" ON public.settings;
CREATE POLICY "Allow admin write on settings" ON public.settings FOR ALL TO authenticated USING ((select auth.jwt()) ->> 'email' IN ('admin@unoskors.com', 'riskicahyadi.2nd@gmail.com')) WITH CHECK ((select auth.jwt()) ->> 'email' IN ('admin@unoskors.com', 'riskicahyadi.2nd@gmail.com'));

DROP POLICY IF EXISTS "Allow admin all on storage" ON storage.objects;
CREATE POLICY "Allow admin all on storage" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'game-reports' AND ((select auth.jwt()) ->> 'email' IN ('admin@unoskors.com', 'riskicahyadi.2nd@gmail.com'))) WITH CHECK (bucket_id = 'game-reports' AND ((select auth.jwt()) ->> 'email' IN ('admin@unoskors.com', 'riskicahyadi.2nd@gmail.com')));
