-- Membuat tabel user dengan username dan password
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- Membuat index untuk performa pencarian username
CREATE INDEX idx_users_username ON users(username);

-- Membuat trigger untuk update timestamp otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    SET search_path = 'public';
    NEW.updated_at = NOW() AT TIME ZONE 'Asia/Jakarta';
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Mengaktifkan Row Level Security (RLS) untuk keamanan
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Membuat policy untuk mengizinkan pengguna mengakses data mereka sendiri
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING ((select auth.uid())::text = id::text);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING ((select auth.uid())::text = id::text);

-- Policy untuk registrasi (insert) - bisa disesuaikan sesuai kebutuhan
CREATE POLICY "Enable insert for authenticated users" ON users
    FOR INSERT WITH CHECK (true);

-- Insert data default user
INSERT INTO users (username, password) VALUES ('rc', 'rc');
