-- Tambahkan kolom updated_at jika belum ada
ALTER TABLE "public"."keep_alive" 
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Hapus kebijakan RLS lama jika ada
DROP POLICY IF EXISTS "Allow public read-only access" ON "public"."keep_alive";
DROP POLICY IF EXISTS "Allow anon full access" ON "public"."keep_alive";
DROP POLICY IF EXISTS "Allow anon insert keep_alive" ON "public"."keep_alive";
DROP POLICY IF EXISTS "Allow anon update keep_alive" ON "public"."keep_alive";
DROP POLICY IF EXISTS "Allow anon delete keep_alive" ON "public"."keep_alive";

-- Buat kebijakan RLS baru yang aman & mendukung Random ID
CREATE POLICY "Allow public read-only access" ON "public"."keep_alive"
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow anon insert keep_alive" ON "public"."keep_alive"
    FOR INSERT
    TO anon
    WITH CHECK (id > 0);

CREATE POLICY "Allow anon update keep_alive" ON "public"."keep_alive"
    FOR UPDATE
    TO anon
    USING (id > 0)
    WITH CHECK (id > 0);

CREATE POLICY "Allow anon delete keep_alive" ON "public"."keep_alive"
    FOR DELETE
    TO anon
    USING (id > 0);
