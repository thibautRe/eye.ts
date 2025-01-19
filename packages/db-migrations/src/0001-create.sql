DROP TABLE IF EXISTS picture_sizes;
DROP TABLE IF EXISTS pictures;
DROP TABLE IF EXISTS camera_bodies;
DROP TABLE IF EXISTS camera_lenses;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE camera_bodies (
    id SERIAL NOT NULL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE camera_lenses (
    id SERIAL NOT NULL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE pictures (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    name TEXT NULL,
    original_file_name TEXT NOT NULL,
    original_width INT NOT NULL,
    original_height INT NOT NULL,
    original_s3_key TEXT NOT NULL,
    blurhash TEXT NOT NULL,
    alt TEXT NOT NULL,

    shot_by_user_id INT NULL REFERENCES users(id),
    shot_by_camera_body_id INT NULL REFERENCES camera_bodies(id),
    shot_by_camera_lens_id INT NULL REFERENCES camera_lenses(id),
    shot_at TIMESTAMP NULL,

    exif JSONB NULL,

    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE picture_sizes (
    picture_id INT NOT NULL REFERENCES pictures(id),
    s3_key TEXT NOT NULL,
    height INT NOT NULL,
    width INT NOT NULL,

    UNIQUE(picture_id, height, width)
);


INSERT INTO camera_bodies (name) VALUES ('ILCE-7RM3A');
INSERT INTO camera_lenses (name) VALUES ('FE 24-105mm F4 G OSS'), ('SAMYANG AF 135mm F1.8');