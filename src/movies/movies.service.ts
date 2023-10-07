import { Injectable } from '@nestjs/common';
import { connection } from 'src/configs/connection';
import { moviesCreateInput } from 'src/types/movies';

@Injectable()
export class MoviesService {
    async createMovie(movie: moviesCreateInput) {
        const { title, episode_id, opening_crawl, director, producer,
            release_date, characters, planets, starships, vehicles } = movie;
        return connection.films.create({
            data: {
                title, episode_id, opening_crawl, director, producer, release_date: new Date(release_date),
                characters: {
                    createMany: {
                        data: characters.map(({ url }) => ({ url }))
                    }
                },
                planets: {
                    createMany: {
                        data: planets.map(({ url }) => ({ url }))
                    }
                },
                starships: {
                    createMany: {
                        data: starships.map(({ url }) => ({ url }))
                    }
                },
                vehicles: {
                    createMany: {
                        data: vehicles.map(({ url }) => ({ url }))
                    }
                }
            }
        })
    }
}
