import { Controller, Get, Query, Post, Body, HttpException, HttpStatus, Put, Delete, Req, Param } from '@nestjs/common';
import { ObjectInfoService } from 'helpers/objectInfo.service';
import { Character, Movie, Planet, Starship, Vehicle } from 'types/tables';
import { MoviesService } from './movies.service';
import { moviesCreateInput, nestedObjectCreateInput } from 'types/movies';
import { CharactersService } from 'modules/characters/characters.service';
@Controller('movies')
export class MoviesController {
    constructor(private readonly objectInfoService: ObjectInfoService, private readonly moviesService: MoviesService, private readonly charactersService: CharactersService) { }

    async returnFlatResults(url: string, page: number): Promise<{ results: Planet[] | Starship[] | Vehicle[], total_records: number, row_count: number, page: number }> {
        let { data: response } = await this.objectInfoService.getObjectInfo(url);

        response.total_records = response.count;
        response.row_count = response.results.length;
        response.page = +page;

        delete response.next;
        delete response.count;
        delete response.previous;

        this.objectInfoService.deleteNestedObjectsOfArrayResponse(response.results);
        return response;
    }

    @Post()
    async createMovie(@Body() data: moviesCreateInput): Promise<Movie> {
        try {
            const [status, json] = this.objectInfoService.areUrlsValid([...data.characters.map(({ url }) => url), ...data.starships.map(({ url }) => url), ...data.vehicles.map(({ url }) => url), ...data.planets.map(({ url }) => url)]);
            if (!status) throw new HttpException(json, HttpStatus.BAD_REQUEST);
            await Promise.all([...data.characters, ...data.starships, ...data.vehicles, ...data.planets].map(({ url }) => this.objectInfoService.getObjectInfo(url)));
            let response = await this.moviesService.createMovie(data);
            return response;
        } catch (error) {
            if (error?.response?.status == 404) {
                throw new HttpException(`${error.response.config.url} is not valid`, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    @Get()
    async findAll(@Query('page') page: number, @Query('search') search: string) {
        if (!page) page = 1 - 1;
        const movies = await this.moviesService.getAllPaginated(page, search);
        return movies;
    }

    @Get(":id")
    async getByID(@Param("id") record_id: string) {
        const movie = await this.moviesService.getMovieByID(+record_id);
        if (!movie) throw new HttpException("No movie was found with that ID", HttpStatus.NOT_FOUND);
        return movie;
    }

    @Put(":id")
    async updateMovie(@Param("id") record_id: string, @Body() data: Movie) {
        try {
            const getUrlsFromArray = (data: nestedObjectCreateInput[] = []) => {
                return data.filter((object) => !object.id).map(({ url }) => url)
            };
            const urls = [...getUrlsFromArray(data.characters), ...getUrlsFromArray(data.starships), ...getUrlsFromArray(data.vehicles), ...getUrlsFromArray(data.planets)];
            const [status, json] = this.objectInfoService.areUrlsValid(urls);
            if (!status) throw new HttpException(json, HttpStatus.NOT_FOUND);
            await Promise.all(urls.map((url) => this.objectInfoService.getObjectInfo(url)));
            const movie = await this.moviesService.getMovieByID(+record_id);
            if (!movie) throw new HttpException("No movie was found with that ID", HttpStatus.NOT_FOUND);
            const response = await this.moviesService.updateMovie(+record_id, data);
            return response;
        } catch (error) {
            if (error?.response?.status == 404) {
                throw new HttpException(`${error.response.config.url} is not valid`, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete(":id")
    async deleteMovie(@Param("id") record_id: string): Promise<{ msg: string; }> {
        await this.moviesService.deleteMovieByID(+record_id);
        return { msg: "Movie was deleted successfully" }
    }

    @Get("resources/characters")
    async getAllCharacters(@Query('page') page: number, @Query('search') search: string): Promise<{ results: Character[], total_records: number, row_count: number, page: number }> {
        const response = await this.charactersService.getAll(page, search);
        return response;
    }

    @Get("resources/planets")
    async getAllPlanets(@Query('page') page: number, @Query('search') search: string): Promise<{ results: Planet[], total_records: number, row_count: number, page: number }> {
        if (!page) page = 1;
        const searchFilter = search ? `&search=${search}` : "";
        const response = await this.returnFlatResults(`https://swapi.dev/api/planets?page=${page}${searchFilter}`, page);
        return response;
    }

    @Get("resources/starships")
    async getAllStarships(@Query('page') page: number, @Query('search') search: string): Promise<{ results: Starship[], total_records: number, row_count: number, page: number }> {
        if (!page) page = 1;
        const searchFilter = search ? `&search=${search}` : "";
        const response = await this.returnFlatResults(`https://swapi.dev/api/starships?page=${page}${searchFilter}`, page);
        return response;
    }

    @Get("resources/vehicles")
    async getAllVehicles(@Query('page') page: number, @Query('search') search: string): Promise<{ results: Vehicle[], total_records: number, row_count: number, page: number }> {
        if (!page) page = 1;
        const searchFilter = search ? `&search=${search}` : "";
        const response = await this.returnFlatResults(`https://swapi.dev/api/vehicles?page=${page}${searchFilter}`, page);
        return response;
    }
}
