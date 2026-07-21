CREATE TABLE IF NOT EXISTS "public"."keep_alive" (
    "id" SERIAL PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS to satisfy the linter
ALTER TABLE "public"."keep_alive" ENABLE ROW LEVEL SECURITY;

-- Grant full access to anon and select access to others
GRANT ALL ON TABLE "public"."keep_alive" TO "anon";
GRANT SELECT ON TABLE "public"."keep_alive" TO "authenticated";
GRANT SELECT ON TABLE "public"."keep_alive" TO "service_role";

-- Create policies to allow public read-only access and anon keep-alive ping (upsert on id = 1)
CREATE POLICY "Allow public read-only access" ON "public"."keep_alive"
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow anon insert keep_alive" ON "public"."keep_alive"
    FOR INSERT
    TO anon
    WITH CHECK (id = 1);

CREATE POLICY "Allow anon update keep_alive" ON "public"."keep_alive"
    FOR UPDATE
    TO anon
    USING (id = 1)
    WITH CHECK (id = 1);
