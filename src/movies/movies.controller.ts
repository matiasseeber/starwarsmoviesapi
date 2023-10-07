import { Controller, Get, Query, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ObjectInfoService } from 'src/helpers/objectInfo.service';
import { Character, Film, Planet, Starship, Vehicle } from 'src/types/tables';
import { MoviesService } from './movies.service';
import { moviesCreateInput } from 'src/types/movies';
@Controller('movies')
export class MoviesController {
    constructor(private readonly objectInfoService: ObjectInfoService, private readonly moviesService: MoviesService) { }

    async returnFlatResults(url: string, page: number): Promise<{ results: Planet[] | Starship[] | Vehicle[], total_records: number, row_count: number, page: number }> {
        if (!page) page = 1;
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
    async createMovie(@Body() data: moviesCreateInput): Promise<Film> {
        try {
            await Promise.all([...data.characters, ...data.starships, ...data.vehicles, ...data.planets].map(({ url }) => this.objectInfoService.getObjectInfo(url)));
            let response = await this.moviesService.createMovie(data);
            return response;
        } catch (error) {
            console.log(error)
            if(error.response.status == 404){
                throw new HttpException(`${error.response.config.url} is not valid`, HttpStatus.NOT_FOUND);    
            }
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    @Get("characters")
    async getAllCharacters(@Query('page') page: number): Promise<{ results: Character[], total_records: number, row_count: number, page: number }> {
        if (!page) page = 1;
        let { data: response } = await this.objectInfoService.getObjectInfo(`https://swapi.dev/api/people?page=${page}`);

        response.total_records = response.count;
        response.row_count = response.results.length;
        response.page = +page;

        delete response.next;
        delete response.count;
        delete response.previous;

        //uncomment if vehicles and starships info is needed

        // let vehiclesPromises = [];
        // let processedVehicles = [];
        // let starshipsPromises = [];
        // let processedStarships = [];
        let planetPromises = [];
        let processedPlanets = [];

        response.results.forEach((element: Character) => {
            delete element.species;
            delete element.films;

            if (!processedPlanets.includes(element.homeworld) && typeof element.homeworld === 'string') {
                processedPlanets.push(element.homeworld);
                planetPromises.push(this.objectInfoService.getObjectInfo(element.homeworld));
            }

            // element.vehicles.forEach((url: string) => {
            //     if (!processedVehicles.includes(url)) {
            //         processedVehicles.push(url);
            //         vehiclesPromises.push(this.objectInfoService.getObjectInfo(url));
            //     }
            // });
            // element.starships.forEach((url: string) => {
            //     if (!processedStarships.includes(url)) {
            //         processedStarships.push(url);
            //         starshipsPromises.push(this.objectInfoService.getObjectInfo(url));
            //     }
            // });
        });

        // let vehiclesResponses = await Promise.all(vehiclesPromises).then((responses) => responses.map((response) => response.data));
        // let starshipsResponses = await Promise.all(starshipsPromises).then((responses) => responses.map((response) => response.data));
        let planetResponses = await Promise.all(planetPromises).then((responses) => responses.map((response) => response.data));;

        // this.objectInfoService.deleteNestedObjectsOfArrayResponse(vehiclesResponses);
        // this.objectInfoService.deleteNestedObjectsOfArrayResponse(starshipsResponses);
        this.objectInfoService.deleteNestedObjectsOfArrayResponse(planetResponses);

        response.results.forEach((element: Character) => {
            // const { vehicles, starships } = element;
            // const filteredVehicles = vehiclesResponses.filter((item: Vehicle) => vehicles.includes(item.url));
            // const filteredStarships = starshipsResponses.filter((item: Starship) => starships.includes(item.url));
            const homeworld = planetResponses.find((item: Planet) => item.url);
            element.homeworld = homeworld;
            // element.vehicles = filteredVehicles;
            // element.starships = filteredStarships;
        });

        return response;
    }

    @Get("planets")
    async getAllPlanets(@Query('page') page: number): Promise<{ results: Planet[], total_records: number, row_count: number, page: number }> {
        const response = await this.returnFlatResults(`https://swapi.dev/api/planets?page=${page}`, page);
        return response;
    }

    @Get("starships")
    async getAllStarships(@Query('page') page: number): Promise<{ results: Starship[], total_records: number, row_count: number, page: number }> {
        const response = await this.returnFlatResults(`https://swapi.dev/api/starships?page=${page}`, page);
        return response;
    }

    @Get("vehicles")
    async getAllVehicles(@Query('page') page: number): Promise<{ results: Vehicle[], total_records: number, row_count: number, page: number }> {
        const response = await this.returnFlatResults(`https://swapi.dev/api/vehicles?page=${page}`, page);
        return response;
    }
}
