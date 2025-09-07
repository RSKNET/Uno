-- Tambah kolom untuk tracking refresh status
ALTER TABLE history
ADD COLUMN IF NOT EXISTS needs_refresh BOOLEAN DEFAULT FALSE;

-- Tambah index untuk performa query
CREATE INDEX IF NOT EXISTS idx_history_needs_refresh ON history (needs_refresh)
WHERE
    needs_refresh = TRUE;

-- Tambah index untuk tracking updated_at
CREATE INDEX IF NOT EXISTS idx_history_updated_at ON history (updated_at);

-- Update existing records yang sudah expired
UPDATE history
SET
    needs_refresh = TRUE
WHERE
    updated_at < NOW () - INTERVAL '11 months';