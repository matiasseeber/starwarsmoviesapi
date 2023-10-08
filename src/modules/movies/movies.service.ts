import { Injectable } from '@nestjs/common';
import { connection } from 'src/configs/connection';
import { ObjectInfoService } from 'src/helpers/objectInfo.service';
import { moviesCreateInput } from 'src/types/movies';
import { Movie } from 'src/types/tables';

@Injectable()
export class MoviesService {
    private objectInfoService = new ObjectInfoService();
    async createMovie(movie: moviesCreateInput) {
        const { title, episode_id, opening_crawl, director, producer,
            release_date, characters, planets, starships, vehicles } = movie;
        return connection.movies.create({
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
    async getAllPaginated(page: number, search?: string): Promise<{ results: Movie[], total_records: number, row_count: number, page: number }> {
        const select = {
            select: {
                id: true,
                active: true,
                url: true,
                created_at: true,
                updated_at: true
            }
        };
        let [movies, total_records] = await Promise.all([
            connection.movies.findMany({
                where: {
                    active: true,
                    title: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                include: {
                    vehicles: select,
                    characters: select,
                    starships: select,
                    planets: select
                },
                skip: page ?? page * 10,
            }),
            connection.movies.count({
                where: {
                    active: true,
                    title: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }
            })
        ])

        const objectInfoService = new ObjectInfoService();

        const [uniqueUrls, nestedObjectsReference] = objectInfoService.returnNestedObjectsReferenceAndUrls(movies);

        const uniqueUrlsArray = Array.from(uniqueUrls);

        if (uniqueUrls.size > 0) {
            const response = await Promise.all(uniqueUrlsArray.map((url: string) => objectInfoService.getObjectInfo(url))).then((responses) => responses.map((response) => response.data));
            objectInfoService.deleteNestedObjectsOfArrayResponse(response);
            objectInfoService.mapObjectWithUrl(nestedObjectsReference, response);
        }

        return {
            total_records,
            row_count: movies.length,
            page: page + 1,
            results: movies
        };
    }
    async getMovieByID(id: number) {
        const select = {
            select: {
                id: true,
                active: true,
                url: true,
                created_at: true,
                updated_at: true
            }
        };
        const movie = await connection.movies.findUnique({
            where: {
                active: true,
                id
            },
            include: {
                vehicles: select,
                characters: select,
                starships: select,
                planets: select
            }
        })

        if (!movie) return movie;

        const [uniqueUrls, nestedObjectsReference] = this.objectInfoService.returnNestedObjectsReferenceAndUrls([movie]);

        const uniqueUrlsArray = Array.from(uniqueUrls);

        const nestedObjectsResponse = await Promise.all(uniqueUrlsArray.map((url: string) => this.objectInfoService.getObjectInfo(url))).then((responses) => responses.map((response) => response.data));
        this.objectInfoService.deleteNestedObjectsOfArrayResponse(nestedObjectsResponse);
        this.objectInfoService.mapObjectWithUrl(nestedObjectsReference, nestedObjectsResponse);

        return movie;
    }
    async deleteMovieByID(id: number) {
        return connection.movies.update({
            where: {
                id
            },
            data: {
                active: false
            }
        })
    }
    async updateMovie(id: number, data: Movie) {
        const mapCallback = (record) => {
            const { id: record_id, active, url } = record;
            if (record_id) {
                return connection.characters.update({
                    where: {
                        id: record_id
                    },
                    data: {
                        active
                    }
                })
            };
            return connection.characters.create({
                data: {
                    url,
                    film_id: id
                }
            });
        }
        const {
            director, episode_id, opening_crawl, producer, release_date,
            planets = [], characters = [], starships = [], vehicles = []
        } = data;

        const objectInfoService = new ObjectInfoService();

        await Promise.all([...characters, ...starships, ...vehicles, ...planets].filter(({ id }) => !id).map(({ url }) => objectInfoService.getObjectInfo(url)));

        return connection.$transaction([
            connection.movies.update({
                where: {
                    id
                },
                data: {
                    director,
                    episode_id,
                    opening_crawl,
                    producer,
                    release_date,
                }
            }),
            ...characters.map(mapCallback),
            ...planets.map(mapCallback),
            ...starships.map(mapCallback),
            ...vehicles.map(mapCallback)
        ])
    }
}
