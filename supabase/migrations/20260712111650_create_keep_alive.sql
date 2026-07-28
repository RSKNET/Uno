-- Table definition for keep_alive
CREATE TABLE IF NOT EXISTS public.keep_alive (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.keep_alive ENABLE ROW LEVEL SECURITY;

-- Role Privileges
GRANT ALL ON TABLE public.keep_alive TO anon;
GRANT SELECT ON TABLE public.keep_alive TO authenticated;
GRANT SELECT ON TABLE public.keep_alive TO service_role;

-- RLS Policies
CREATE POLICY "Allow public read-only access" ON public.keep_alive
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Allow anon insert keep_alive" ON public.keep_alive
    FOR INSERT TO anon
    WITH CHECK (id > 0);

CREATE POLICY "Allow anon update keep_alive" ON public.keep_alive
    FOR UPDATE TO anon
    USING (id > 0)
    WITH CHECK (id > 0);

CREATE POLICY "Allow anon delete keep_alive" ON public.keep_alive
    FOR DELETE TO anon
    USING (id > 0);
