CREATE DATABASE "star_wars_api"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

CREATE TABLE users (
    id serial PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
	password varchar(256),
	verification_code varchar(20),
	verificated_at TIMESTAMP WITHOUT TIME ZONE,
	verification_code_sent_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT unique_username_email UNIQUE (username, email)
);

-- Trigger to update updated_at on UPDATE
CREATE OR REPLACE FUNCTION set_updated() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated();

alter table users add column is_admin boolean default false