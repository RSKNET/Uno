SET session_replication_role = replica;

-- Data untuk tabel maintenance
INSERT INTO "public"."maintenance" ("id", "maintenance") VALUES
	(1, false),
	(2, true)
ON CONFLICT (id) DO NOTHING;

-- Data untuk tabel unlimited_round
INSERT INTO "public"."unlimited_round" ("id", "unlimited") VALUES
	(1, true),
	(2, false)
ON CONFLICT (id) DO NOTHING;

-- Data untuk tabel settings
INSERT INTO "public"."settings" ("id", "max_players", "rounds", "unlimited_id", "maintenance_id") VALUES
	(1, 100, 40, 1, 1)
ON CONFLICT (id) DO NOTHING;

-- Data untuk tabel users
INSERT INTO "public"."users" ("id", "username", "password", "created_at", "updated_at") VALUES
	('a94d5404-827f-40b3-a56d-41423aca367b', 'rc', 'rc', '2025-08-28 12:01:08.052556+00', '2025-08-28 12:01:08.052556+00')
ON CONFLICT (id) DO NOTHING;

-- Data untuk Storage Buckets (Biar gak bentrok)
INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('history-pdf', 'history-pdf', NULL, '2025-09-02 16:35:06.83998+00', '2025-09-02 16:35:06.83998+00', false, false, NULL, NULL, NULL, 'STANDARD'),
	('history-json', 'history-json', NULL, '2025-09-02 17:10:50.162871+00', '2025-09-02 17:10:50.162871+00', false, false, NULL, NULL, NULL, 'STANDARD')
ON CONFLICT (id) DO NOTHING;

-- Data placeholder objects dalam bucket
INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('bf0b39b4-a239-4e4d-899d-b5ea53fcc8a3', 'history-pdf', '.emptyFolderPlaceholder', NULL, '2026-06-16 10:46:12.679178+00', '2026-06-16 10:46:12.679178+00', '2026-06-16 10:46:12.679178+00', '{"eTag": "\"d41d8cd98f00b204e9800998ecf8427e\"", "size": 0, "mimetype": "inode/x-empty", "cacheControl": "no-cache", "lastModified": "2026-06-16T10:46:12.664Z", "contentLength": 0, "httpStatusCode": 200}', '05046022-da39-4240-ba15-348df87c90d7', NULL, '{}'),
	('14078ca2-b3a5-4324-a4d1-9aab8b63ed75', 'history-json', '.emptyFolderPlaceholder', NULL, '2026-06-16 10:46:24.226336+00', '2026-06-16 10:46:24.226336+00', '2026-06-16 10:46:24.226336+00', '{"eTag": "\"d41d8cd98f00b204e9800998ecf8427e\"", "size": 0, "mimetype": "inode/x-empty", "cacheControl": "no-cache", "lastModified": "2026-06-16T10:46:24.211Z", "contentLength": 0, "httpStatusCode": 200}', 'c47d6473-c66f-4a53-8abb-fdd66d07c103', NULL, '{}')
ON CONFLICT (id) DO NOTHING;

-- Perbarui urutan sequence id database lokal
SELECT pg_catalog.setval('"public"."maintenance_id_seq"', 2, true);
SELECT pg_catalog.setval('"public"."settings_id_seq"', 1, true);
SELECT pg_catalog.setval('"public"."unlimited_round_id_seq"', 2, true);

RESET ALL;