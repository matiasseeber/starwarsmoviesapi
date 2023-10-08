export type User = {
    id?: number;
    username?: string;
    email?: string;
    password?: string | null;
    verification_code?: string | null;
    verificated_at?: Date | null;
    verification_code_sent_at?: Date | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    is_admin?: boolean | null;
    logins?: Login[] | null;
};

export type Login = {
    id?: number;
    user_id?: number;
    refresh_token?: string;
    created_at?: Date | null;
    user?: User | null;
};

export type Character = {
    id?: number;
    url?: string | null;
    active?: boolean | null;
    film_id?: number | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    vehicles?: Vehicle[] | string[];
    starships?: Starship[] | string[];
    homeworld?: Planet | string;
    species?: [];
    films?: [];
};

export type Movie = {
    id?: number;
    title?: string | null;
    episode_id?: number | null;
    opening_crawl?: string | null;
    director?: string | null;
    producer?: string | null;
    release_date?: Date | null;
    active?: boolean | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    characters?: Character[] | null;
    planets?: Planet[] | null;
    starships?: Starship[] | null;
    vehicles?: Vehicle[] | null;
};

export type Planet = {
    id?: number;
    url?: string | null;
    active?: boolean | null;
    film_id?: number | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    film?: Movie | null;
};

export type Starship = {
    id?: number;
    url?: string | null;
    active?: boolean | null;
    film_id?: number | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    film?: Movie | null;
};

export type Vehicle = {
    id?: number;
    url?: string | null;
    active?: boolean | null;
    film_id?: number | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    film?: Movie | null;
};
