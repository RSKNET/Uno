CREATE TABLE IF NOT EXISTS "public"."keep_alive" (
    "id" SERIAL PRIMARY KEY,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS to satisfy the linter
ALTER TABLE "public"."keep_alive" ENABLE ROW LEVEL SECURITY;

-- Grant select access to anon and authenticated roles so the keep-alive ping workflow can query it
GRANT SELECT ON TABLE "public"."keep_alive" TO "anon";
GRANT SELECT ON TABLE "public"."keep_alive" TO "authenticated";
GRANT SELECT ON TABLE "public"."keep_alive" TO "service_role";

-- Create policy to allow read-only select access to anyone
CREATE POLICY "Allow public read-only access" ON "public"."keep_alive"
    FOR SELECT
    TO anon, authenticated
    USING (true);
