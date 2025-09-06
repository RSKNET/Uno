CREATE OR REPLACE FUNCTION cleanup_history_storage_files()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'history-pdf' AND name = OLD.pdf_filename;
    
    DELETE FROM storage.objects 
    WHERE bucket_id = 'history-json' AND name = OLD.json_filename;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER cleanup_history_files_on_delete
    AFTER DELETE ON history
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_history_storage_files();

CREATE OR REPLACE FUNCTION cleanup_history_storage_files_on_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.pdf_filename IS DISTINCT FROM NEW.pdf_filename AND OLD.pdf_filename IS NOT NULL THEN
        DELETE FROM storage.objects 
        WHERE bucket_id = 'history-pdf' AND name = OLD.pdf_filename;
    END IF;
    
    IF OLD.json_filename IS DISTINCT FROM NEW.json_filename AND OLD.json_filename IS NOT NULL THEN
        DELETE FROM storage.objects 
        WHERE bucket_id = 'history-json' AND name = OLD.json_filename;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER cleanup_history_files_on_update
    AFTER UPDATE ON history
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_history_storage_files_on_update();

GRANT EXECUTE ON FUNCTION cleanup_history_storage_files() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_history_storage_files_on_update() TO authenticated;
