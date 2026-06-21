


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."cleanup_history_storage_files"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    SET search_path = 'public, storage';
    DELETE FROM storage.objects 
    WHERE bucket_id = 'history-pdf' AND name = OLD.pdf_filename;
    
    DELETE FROM storage.objects 
    WHERE bucket_id = 'history-json' AND name = OLD.json_filename;
    
    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."cleanup_history_storage_files"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_history_storage_files_on_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    SET search_path = 'public, storage';
    IF OLD.pdf_filename IS DISTINCT FROM NEW.pdf_filename AND OLD.pdf_filename IS NOT NULL THEN
        DELETE FROM storage.objects 
        WHERE bucket_id = 'history-pdf' AND name = OLD.pdf_filename;
    END IF;
    
    IF OLD.json_filename IS DISTINCT FROM NEW.json_filename AND OLD.json_filename IS NOT NULL THEN
        DELETE FROM storage.objects 
        WHERE bucket_id = 'history-json' AND name = OLD.json_filename;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."cleanup_history_storage_files_on_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ping"() RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN 'success';
END;
$$;


ALTER FUNCTION "public"."ping"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_players_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    SET search_path = 'public';
    NEW.updated_at = NOW() AT TIME ZONE 'Asia/Jakarta';
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_players_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    SET search_path = 'public';
    NEW.updated_at = NOW() AT TIME ZONE 'Asia/Jakarta';
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "game_id" "uuid" NOT NULL,
    "pdf" "text" NOT NULL,
    "json" "text" NOT NULL,
    "pdf_filename" "text" NOT NULL,
    "json_filename" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT ("now"() AT TIME ZONE 'Asia/Jakarta'::"text"),
    "updated_at" timestamp without time zone DEFAULT ("now"() AT TIME ZONE 'Asia/Jakarta'::"text")
);


ALTER TABLE "public"."history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."maintenance" (
    "id" integer NOT NULL,
    "maintenance" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."maintenance" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."maintenance_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."maintenance_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."maintenance_id_seq" OWNED BY "public"."maintenance"."id";



CREATE TABLE IF NOT EXISTS "public"."players" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'Asia/Jakarta'::"text"),
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'Asia/Jakarta'::"text")
);


ALTER TABLE "public"."players" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."settings" (
    "id" integer NOT NULL,
    "max_players" integer DEFAULT 10 NOT NULL,
    "rounds" integer DEFAULT 40 NOT NULL,
    "unlimited_id" integer,
    "maintenance_id" integer
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."settings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."settings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."settings_id_seq" OWNED BY "public"."settings"."id";



CREATE TABLE IF NOT EXISTS "public"."unlimited_round" (
    "id" integer NOT NULL,
    "unlimited" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."unlimited_round" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."unlimited_round_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."unlimited_round_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."unlimited_round_id_seq" OWNED BY "public"."unlimited_round"."id";



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "username" character varying(50) NOT NULL,
    "password" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'Asia/Jakarta'::"text"),
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'Asia/Jakarta'::"text")
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."maintenance" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."maintenance_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."settings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."settings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."unlimited_round" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."unlimited_round_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."history"
    ADD CONSTRAINT "history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."maintenance"
    ADD CONSTRAINT "maintenance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."unlimited_round"
    ADD CONSTRAINT "unlimited_round_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE INDEX "idx_history_created_at" ON "public"."history" USING "btree" ("created_at");



CREATE INDEX "idx_history_game_id" ON "public"."history" USING "btree" ("game_id");



CREATE INDEX "idx_history_id" ON "public"."history" USING "btree" ("id");



CREATE INDEX "idx_history_updated_at" ON "public"."history" USING "btree" ("updated_at");



CREATE INDEX "idx_players_name" ON "public"."players" USING "btree" ("name");



CREATE INDEX "idx_users_username" ON "public"."users" USING "btree" ("username");



CREATE OR REPLACE TRIGGER "update_history_updated_at" BEFORE UPDATE ON "public"."history" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_players_updated_at" BEFORE UPDATE ON "public"."players" FOR EACH ROW EXECUTE FUNCTION "public"."update_players_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "public"."maintenance"("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_unlimited_id_fkey" FOREIGN KEY ("unlimited_id") REFERENCES "public"."unlimited_round"("id");



CREATE POLICY "Enable all operations for authenticated users on maintenance" ON "public"."maintenance" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all operations for authenticated users on settings" ON "public"."settings" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable all operations for authenticated users on unlimited_roun" ON "public"."unlimited_round" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable delete for authenticated users" ON "public"."players" FOR DELETE USING (true);



CREATE POLICY "Enable delete for authenticated users only" ON "public"."history" FOR DELETE USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Enable insert for authenticated users" ON "public"."players" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users" ON "public"."users" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."history" FOR INSERT WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Enable read access for all users" ON "public"."history" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."players" FOR SELECT USING (true);



CREATE POLICY "Enable update for authenticated users" ON "public"."players" FOR UPDATE USING (true);



CREATE POLICY "Enable update for authenticated users only" ON "public"."history" FOR UPDATE USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Users can update own data" ON "public"."users" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid"))::"text" = ("id")::"text"));



CREATE POLICY "Users can view own data" ON "public"."users" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid"))::"text" = ("id")::"text"));



ALTER TABLE "public"."history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."maintenance" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."players" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."unlimited_round" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."history";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."maintenance";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."settings";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON FUNCTION "public"."cleanup_history_storage_files"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_history_storage_files"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_history_storage_files"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_history_storage_files_on_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_history_storage_files_on_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_history_storage_files_on_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."ping"() TO "anon";
GRANT ALL ON FUNCTION "public"."ping"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ping"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_players_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_players_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_players_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;












GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."history" TO "anon";
GRANT ALL ON TABLE "public"."history" TO "authenticated";
GRANT ALL ON TABLE "public"."history" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."maintenance" TO "anon";
GRANT ALL ON TABLE "public"."maintenance" TO "authenticated";
GRANT ALL ON TABLE "public"."maintenance" TO "service_role";



GRANT ALL ON SEQUENCE "public"."maintenance_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."maintenance_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."maintenance_id_seq" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."players" TO "anon";
GRANT ALL ON TABLE "public"."players" TO "authenticated";
GRANT ALL ON TABLE "public"."players" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT ALL ON TABLE "public"."settings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."settings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."settings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."settings_id_seq" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."unlimited_round" TO "anon";
GRANT ALL ON TABLE "public"."unlimited_round" TO "authenticated";
GRANT ALL ON TABLE "public"."unlimited_round" TO "service_role";



GRANT ALL ON SEQUENCE "public"."unlimited_round_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."unlimited_round_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."unlimited_round_id_seq" TO "service_role";



GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































