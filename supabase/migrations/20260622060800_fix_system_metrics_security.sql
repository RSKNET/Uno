-- ==========================================
-- 9. Fix get_system_metrics() security context
-- ==========================================
ALTER FUNCTION "public"."get_system_metrics"() SECURITY INVOKER;
