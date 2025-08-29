-- Membuat tabel players untuk menyimpan data pemain yang diregistrasikan
-- Kolom total_games menyimpan jumlah total game yang telah dimainkan pemain
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  total_games INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'Asia/Jakarta')
);

-- Membuat index untuk performa pencarian
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_players_total_games ON players(total_games);

-- Membuat trigger untuk update timestamp otomatis
CREATE OR REPLACE FUNCTION update_players_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW() AT TIME ZONE 'Asia/Jakarta';
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_players_updated_at 
    BEFORE UPDATE ON players 
    FOR EACH ROW 
    EXECUTE FUNCTION update_players_updated_at_column();

-- Mengaktifkan Row Level Security (RLS) untuk keamanan
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Membuat policy untuk akses data
CREATE POLICY "Enable read access for all users" ON players
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON players
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON players
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON players
    FOR DELETE USING (true);

-- Insert data contoh pemain
INSERT INTO players (name, total_games) VALUES 
('RISKI C', 0),
('WILDAN', 0),
('FASICH', 0),
('HANIF', 0);
