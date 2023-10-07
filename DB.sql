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

CREATE TABLE logins (
    id serial PRIMARY KEY,
    user_id int references users(id) not null,
    refresh_token varchar(30) not null,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

alter table users add column is_admin boolean default false

CREATE TABLE films (
	id serial PRIMARY KEY,
    title VARCHAR(256),
    episode_id INT,
    opening_crawl TEXT,
    director VARCHAR(256),
    producer VARCHAR(256),
    release_date varchar(50),
	active boolean default true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    edited TIMESTAMP
);

CREATE OR REPLACE FUNCTION set_updated() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_trigger
    BEFORE UPDATE ON films
    FOR EACH ROW
    EXECUTE FUNCTION set_updated();

CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    url TEXT,
    active BOOLEAN default true,
	film_id int references films(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TRIGGER set_updated_characters_trigger
    BEFORE UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION set_updated();

CREATE TABLE planets (
    id SERIAL PRIMARY KEY,
    url TEXT,
    active BOOLEAN default true,
	film_id int references films(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TRIGGER set_updated_planets_trigger
    BEFORE UPDATE ON planets
    FOR EACH ROW
    EXECUTE FUNCTION set_updated();

CREATE TABLE starships (
    id SERIAL PRIMARY KEY,
    url TEXT,
    active BOOLEAN default true,
	film_id int references films(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TRIGGER set_updated_starships_trigger
    BEFORE UPDATE ON starships
    FOR EACH ROW
    EXECUTE FUNCTION set_updated();

CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    url TEXT,
    active BOOLEAN default true,
	film_id int references films(id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TRIGGER set_updated_vehicles_trigger
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION set_updated();

alter table films drop column edited 
alter table films add column updated_at TIMESTAMP WITHOUT TIME ZONE

alter table films drop column release_date
ALTER TABLE films
ADD COLUMN release_date TIMESTAMP WITHOUT TIME ZONE;