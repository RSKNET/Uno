-- ==========================================
-- 8. Get System Metrics Function
-- ==========================================
CREATE OR REPLACE FUNCTION "public"."get_system_metrics"()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
DECLARE
  v_version text;
  v_rls_enabled boolean;
  v_settings_active boolean;
  v_timezone text;
BEGIN
  -- Get PostgreSQL version
  SELECT version() INTO v_version;
  
  -- Check if RLS is enabled on public tables
  SELECT COALESCE(bool_and(rowsecurity), false) INTO v_rls_enabled
  FROM pg_tables 
  WHERE schemaname = 'public' 
    AND tablename IN ('players', 'games', 'scores', 'settings');
    
  -- Check if settings table can be queried
  BEGIN
    PERFORM count(*) FROM public.settings;
    v_settings_active := true;
  EXCEPTION WHEN OTHERS THEN
    v_settings_active := false;
  END;
  
  -- Get TimeZone
  SELECT current_setting('timezone') INTO v_timezone;

  RETURN json_build_object(
    'db_version', v_version,
    'rls_enabled', v_rls_enabled,
    'settings_active', v_settings_active,
    'timezone', v_timezone
  );
END;
$$;
