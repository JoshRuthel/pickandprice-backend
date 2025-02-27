CREATE TABLE
    users (
        id uuid PRIMARY KEY UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    user_templates(
        id uuid PRIMARY KEY UNIQUE,
        user_id uuid NOT NULL,
        template_name TEXT NOT NULL,
        config JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )

CREATE TABLE    
    user_shops(
        id uuid PRIMARY KEY UNIQUE,
        user_id uuid NOT NULL,
        shop_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        items JSON NOT NULL,
        items_total INTEGER NOT NULL,
        savings_total FLOAT NOT NULL
    )

CREATE
OR REPLACE FUNCTION update_timestamp () RETURNS TRIGGER AS '
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
' LANGUAGE plpgsql;

CREATE EXTENSION IF NOT EXISTS pg_trgm;