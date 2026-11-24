-- Schéma de PharmaTrend (PostgreSQL 15 + PostGIS), repris de la base de développement.
-- Rejouable : les tables ne sont créées que si elles n'existent pas.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS users (
    id_user       SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    company_name  VARCHAR(255),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(50) DEFAULT 'PHARMACIST',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Produits des « tendances » : on les fait glisser comme des cartes.
CREATE TABLE IF NOT EXISTS products (
    id_product  SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    category    VARCHAR(100),
    likes_count INTEGER DEFAULT 0,
    image_url   TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Annonces de matériel d'occasion entre pharmacies.
CREATE TABLE IF NOT EXISTS equipments (
    id_equip    SERIAL PRIMARY KEY,
    id_user     INTEGER REFERENCES users (id_user) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    price       NUMERIC(10, 2),
    status      VARCHAR(50) DEFAULT 'Neuf',
    image_url   TEXT,
    location    GEOMETRY(Point, 4326),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS swipes (
    id_swipe   SERIAL PRIMARY KEY,
    id_user    INTEGER REFERENCES users (id_user) ON DELETE CASCADE,
    id_product INTEGER REFERENCES products (id_product) ON DELETE CASCADE,
    action     VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_user, id_product)
);

CREATE TABLE IF NOT EXISTS messages (
    id_message  SERIAL PRIMARY KEY,
    sender_id   INTEGER REFERENCES users (id_user) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users (id_user) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages (sender_id, receiver_id, created_at);
