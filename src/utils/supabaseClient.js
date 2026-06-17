import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Klien ini aman digunakan di sisi client (browser) karena menggunakan anon key
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabaseClient;
