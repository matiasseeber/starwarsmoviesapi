export type User = {
    id?: number;
    username?: string;
    email?: string;
    password?: string | null;
    verification_code?: string | null;
    verificated_at?: string | Date | null;
    verification_code_sent_at?: string | Date | null;
    created_at?: string | Date | null;
    updated_at?: string | Date | null;
    is_admin?: boolean | null;
    logins?: Login[] | null;
};

export type Login = {
    id?: number;
    user_id?: number;
    refresh_token?: string;
    created_at?: string | Date | null;
    user?: User | null;
};

export type Character = {
    id?: number;
    url?: string | null;
    active?: boolean | null;
    film_id?: number | null;
    created_at?: string | Date | null;
    updated_at?: string | Date | null;
    vehicles?: Vehicle[] | string[];
    starships?: Starship[] | string[];
    homeworld?: Planet | string;
    species?: [];
    films?: [];
    data?: Partial<{
        name: string;
        height: string;
        mass: string;
        hair_color: string;
        skin_color: string;
        eye_color: string;
        birth_year: string;
        gender: string;
        homeworld: string;
        created: string;
        edited: string;
        url?: string;
    }>
};

export type Movie = {
    id?: number;
    title?: string | null;
    episode_id?: number | null;
    opening_crawl?: string | null;
    director?: string | null;
    producer?: string | null;
    release_date?: Date | string | null;
    active?: boolean | null;
    created_at?: Date | string | null;
    updated_at?: Date | string | null;
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
    created_at?: string | Date | null;
    updated_at?: string | Date | null;
    film?: Movie | null;
    data?: Partial<{
        name: string;
        rotation_period: string;
        orbital_period: string;
        diameter: string;
        climate: string;
        gravity: string;
        terrain: string;
        surface_water: string;
        population: string;
        created: string;
        edited: string;
        url?: string;
    }>
};

export type Starship = {
    id?: number;
    url?: string | null;
    active?: boolean | null;
    film_id?: number | null;
    created_at?: string | Date | null;
    updated_at?: string | Date | null;
    film?: Movie | null;
    data?: Partial<{
        name: string;
        model: string;
        manufacturer: string;
        cost_in_credits: string;
        length: string;
        max_atmosphering_speed: string;
        crew: string;
        passengers: string;
        cargo_capacity: string;
        consumables: string;
        hyperdrive_rating: string;
        MGLT: string;
        starship_class: string;
        created: string;
        edited: string;
        url?: string;
    }>
};

export type Vehicle = {
    id?: number;
    url?: string | null;
    active?: boolean | null;
    film_id?: number | null;
    created_at?: string | Date | null;
    updated_at?: string | Date | null;
    film?: Movie | null;
    data?: Partial<{
        name: string;
        model: string;
        manufacturer: string;
        cost_in_credits: string;
        length: string;
        max_atmosphering_speed: string;
        crew: string;
        passengers: string;
        cargo_capacity: string;
        consumables: string;
        vehicle_class: string;
        created: string;
        edited: string;
        url?: string;
    }>
};
