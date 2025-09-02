CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL,
    pdf TEXT NOT NULL,
    json TEXT NOT NULL,
    pdf_filename TEXT NOT NULL,
    json_filename TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_history_updated_at BEFORE UPDATE
    ON history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_history_created_at ON history(created_at);
CREATE INDEX idx_history_id ON history(id);
CREATE INDEX idx_history_game_id ON history(game_id);

ALTER TABLE history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON history
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON history
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON history
    FOR DELETE USING (auth.role() = 'authenticated');
