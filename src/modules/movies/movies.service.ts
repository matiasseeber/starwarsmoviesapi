import { Injectable } from '@nestjs/common';
import { connection } from 'configs/connection';
import { ObjectInfoService } from 'helpers/objectInfo.service';
import { moviesCreateInput } from 'types/movies';
import { Movie } from 'types/tables';

@Injectable()
export class MoviesService {
    private objectInfoService = new ObjectInfoService();
    async createMovie(movie: moviesCreateInput) {
        function normalizeUrl(url: string) {
            return url.endsWith("/") ? url : url + "/";
        }
        const mapCallback = (item) => {
            return {
                url: normalizeUrl(item.url)
            }
        }
        const { title, episode_id, opening_crawl, director, producer,
            release_date, characters = [], planets = [], starships = [], vehicles = [] } = movie;
        return connection.movies.create({
            data: {
                title, episode_id, opening_crawl, director, producer, release_date: new Date(release_date),
                characters: {
                    createMany: {
                        data: characters.map(mapCallback)
                    }
                },
                planets: {
                    createMany: {
                        data: planets.map(mapCallback)
                    }
                },
                starships: {
                    createMany: {
                        data: starships.map(mapCallback)
                    }
                },
                vehicles: {
                    createMany: {
                        data: vehicles.map(mapCallback)
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
        const movie: Movie = await connection.movies.findUnique({
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
        const mapCallback = (record, table: string) => {
            const { id: record_id, active, url } = record;
            if (record_id) {
                return connection[table].update({
                    where: {
                        id: record_id
                    },
                    data: {
                        active
                    }
                })
            };
            return connection[table].create({
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
            ...characters.map((record) => mapCallback(record, "characters")),
            ...planets.map((record) => mapCallback(record, "planets")),
            ...starships.map((record) => mapCallback(record, "starships")),
            ...vehicles.map((record) => mapCallback(record, "vehicles"))
        ])
    }
}
