-- Membuat tabel unlimited_round
CREATE TABLE
    unlimited_round (
        id SERIAL PRIMARY KEY,
        unlimited BOOLEAN NOT NULL DEFAULT FALSE
    );

-- Membuat tabel maintenance
CREATE TABLE
    maintenance (
        id SERIAL PRIMARY KEY,
        maintenance BOOLEAN NOT NULL DEFAULT FALSE
    );

-- Membuat tabel settings
CREATE TABLE
    settings (
        id SERIAL PRIMARY KEY,
        max_players INTEGER NOT NULL DEFAULT 10,
        rounds INTEGER NOT NULL DEFAULT 40,
        unlimited_id INTEGER REFERENCES unlimited_round (id),
        maintenance_id INTEGER REFERENCES maintenance (id)
    );

-- Insert data default untuk unlimited_round (on)
INSERT INTO
    unlimited_round (unlimited)
VALUES
    (TRUE);

-- Insert data untuk unlimited_round (off)
INSERT INTO
    unlimited_round (unlimited)
VALUES
    (FALSE);

-- Insert data default untuk maintenance (off)
INSERT INTO
    maintenance (maintenance)
VALUES
    (FALSE);

-- Insert data untuk maintenance (on)
INSERT INTO
    maintenance (maintenance)
VALUES
    (TRUE);

-- Insert data default untuk settings
INSERT INTO
    settings (max_players, rounds, unlimited_id, maintenance_id)
VALUES
    (10, 40, 1, 1);

-- Enable Row Level Security (RLS) untuk tabel unlimited_round
ALTER TABLE unlimited_round ENABLE ROW LEVEL SECURITY;

-- Policy untuk unlimited_round - izinkan semua operasi untuk authenticated users
CREATE POLICY "Enable all operations for authenticated users on unlimited_round" ON unlimited_round FOR ALL TO authenticated USING (true)
WITH
    CHECK (true);

-- Enable Row Level Security (RLS) untuk tabel maintenance
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;

-- Policy untuk maintenance - izinkan semua operasi untuk authenticated users
CREATE POLICY "Enable all operations for authenticated users on maintenance" ON maintenance FOR ALL TO authenticated USING (true)
WITH
    CHECK (true);

-- Enable Row Level Security (RLS) untuk tabel settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policy untuk settings - izinkan semua operasi untuk authenticated users
CREATE POLICY "Enable all operations for authenticated users on settings" ON settings FOR ALL TO authenticated USING (true)
WITH
    CHECK (true);