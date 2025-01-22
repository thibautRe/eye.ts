DROP TABLE IF EXISTS picture_sizes;
DROP TABLE IF EXISTS pictures;
DROP TABLE IF EXISTS camera_bodies;
DROP TABLE IF EXISTS camera_lenses;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS category_parents;
DROP TABLE IF EXISTS category_leaves;

DROP TYPE IF EXISTS category_leaf_type;

CREATE TYPE category_leaf_type AS ENUM('picture', 'person', 'event', 'location');

CREATE TABLE category_leaves (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    slug TEXT NULL,
    name JSONB NOT NULL, -- i18n text
    type category_leaf_type NULL,
    exif_tag TEXT NULL
);
CREATE UNIQUE INDEX category_leaf_slug_lower ON category_leaves(lower(slug)) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX category_leaf_exif_tag_lower ON category_leaves(lower(exif_tag)) WHERE exif_tag IS NOT NULL;

CREATE TABLE category_parents (
    child_id  BIGINT NOT NULL REFERENCES category_leaves(id),
    parent_id BIGINT NOT NULL REFERENCES category_leaves(id),

    CONSTRAINT different CHECK (child_id <> parent_id),
    PRIMARY KEY(child_id, parent_id)
);

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
    category_leaf_id BIGINT NOT NULL REFERENCES category_leaves(id) UNIQUE,

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
    picture_id BIGINT NOT NULL REFERENCES pictures(id),
    s3_key TEXT NOT NULL,
    height INT NOT NULL,
    width INT NOT NULL,

    UNIQUE(picture_id, height, width)
);


INSERT INTO camera_bodies (name) VALUES ('ILCE-7RM3A');
INSERT INTO camera_lenses (name) VALUES ('FE 24-105mm F4 G OSS'), ('SAMYANG AF 135mm F1.8');

INSERT INTO category_leaves (id, slug, name, type, exif_tag) VALUES 
    (1, 'all', '{"en": "all"}', NULL, NULL),
    (2, 'Persons_by_name', '{"en": "Persons by name"}', NULL, NULL),
    (3, 'Atlas', '{"en": "Atlas"}', 'person', 'People/Atlas');
ALTER SEQUENCE category_leaves_id_seq RESTART 4;

INSERT INTO category_parents (child_id, parent_id) VALUES
    (2, 1),
    (3, 2);


