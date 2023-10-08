export type nestedObjectCreateInput = {
    id?: number,
    url?: string,
    active?: boolean,
    film_i?: number,
    created_at?: Date | string,
    updated_at?: Date | string,
}

export type moviesCreateInput = {
    title?: string | null
    episode_id?: number | null
    opening_crawl?: string | null
    director?: string | null
    producer?: string | null
    release_date?: Date | string | null
    characters?: nestedObjectCreateInput[]
    planets?: nestedObjectCreateInput[]
    starships?: nestedObjectCreateInput[]
    vehicles?: nestedObjectCreateInput[]
}