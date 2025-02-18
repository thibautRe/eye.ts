ALTER TABLE pictures 
  DROP COLUMN IF EXISTS rating,
  DROP COLUMN IF EXISTS version;

ALTER TABLE pictures
  ADD COLUMN rating INTEGER NULL,
  ADD COLUMN version INTEGER NULL;

UPDATE pictures SET version = 1, rating = (exif->>'rating')::INTEGER;

ALTER TABLE pictures ALTER COLUMN version SET NOT NULL;