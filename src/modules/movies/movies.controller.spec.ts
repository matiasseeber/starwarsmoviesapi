import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { ObjectInfoService } from 'helpers/objectInfo.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CharactersService } from 'modules/characters/characters.service';

describe('MoviesController', () => {
  let controller: MoviesController;
  let moviesService: MoviesService;
  let objectInfoService: ObjectInfoService;

  const mockMoviesService = {
    createMovie: jest.fn(),
    getMovieByID: jest.fn(),
    updateMovie: jest.fn(),
    getAllPaginated: jest.fn(),
    deleteMovieByID: jest.fn()
  };

  const mockObjectInfoService = {
    areUrlsValid: jest.fn(),
    getObjectInfo: jest.fn(),
    deleteNestedObjectsOfArrayResponse: jest.fn()
  };

  const mockCharactersService = {
    charactersService: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
        {
          provide: ObjectInfoService,
          useValue: mockObjectInfoService,
        },
        {
          provide: CharactersService,
          useValue: mockCharactersService,
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    objectInfoService = module.get<ObjectInfoService>(ObjectInfoService);
    moviesService = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of movies', async () => {
    const mockMovies = [
      {
        id: '1',
        title: 'Movie 1',
      },
      {
        id: '2',
        title: 'Movie 2',
      },
    ];
    mockMoviesService.getAllPaginated.mockResolvedValue({
      results: mockMovies,
      total_records: 2,
      row_count: 2,
      page: 1,
    });

    const movies = await controller.findAll(1, undefined);
    expect(movies).toEqual({
      results: mockMovies,
      total_records: 2,
      row_count: 2,
      page: 1,
    });
  });

  it('should return a movie', async () => {
    const mockMovie = {
      id: '1',
      title: 'Movie 1',
    };
    mockMoviesService.getMovieByID.mockResolvedValue(mockMovie);

    const movie = await controller.getByID('1');
    expect(movie).toEqual(mockMovie);
  });

  it('should throw a 400 code when creating a movie with invalid URL', async () => {
    const mockInvalidUrl = 'INVALID URL';
    const mockMovie = {
      "title": "string",
      "episode_id": 1,
      "opening_crawl": "string",
      "director": "string",
      "producer": "string",
      "release_date": "2000-10-10",
      "characters": [
        {
          "url": mockInvalidUrl
        }
      ],
      "planets": [
        {
          "url": "https://swapi.dev/api/planets/1/"
        }
      ],
      "starships": [
        {
          "url": "https://swapi.dev/api/starships/9/"
        }
      ],
      "vehicles": [
        {
          "url": "https://swapi.dev/api/vehicles/4"
        }
      ]
    };
    const mockResponse = [
      false,
      {
        msg: `${mockInvalidUrl} is not valid`,
        valid_urls: [
          'https://swapi.dev/api/people/',
          'https://swapi.dev/api/planets/',
          'https://swapi.dev/api/vehicles/',
          'https://swapi.dev/api/starships/',
        ].map((item) => item + ':id'),
      },
    ];
    mockObjectInfoService.areUrlsValid.mockReturnValue(mockResponse);

    try {
      await controller.createMovie(mockMovie);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.response.response).toEqual(mockResponse[1]);
      expect(error.status).toEqual(HttpStatus.BAD_REQUEST);
    }
  });

  it('should throw a 404 code when creating a movie with non-existing URL', async () => {
    const mockInvalidUrl = 'https://swapi.dev/api/people/100000';
    const mockMovie = {
      "title": "string",
      "episode_id": 1,
      "opening_crawl": "string",
      "director": "string",
      "producer": "string",
      "release_date": "2000-10-10",
      "characters": [
        {
          "url": mockInvalidUrl
        }
      ],
      "planets": [
        {
          "url": "https://swapi.dev/api/planets/1/"
        }
      ],
      "starships": [
        {
          "url": "https://swapi.dev/api/starships/9/"
        }
      ],
      "vehicles": [
        {
          "url": "https://swapi.dev/api/vehicles/4"
        }
      ]
    };
    const mockResponse = {
      message: `${mockInvalidUrl} is not valid`,
    };
    mockObjectInfoService.areUrlsValid.mockReturnValue([true, undefined]);

    try {
      await controller.createMovie(mockMovie);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.response).toEqual(mockResponse.message);
      expect(error.status).toEqual(HttpStatus.NOT_FOUND);
    }
  });

  it('should create a movie', async () => {
    const mockMovie = {
      title: 'New Movie',
      url: 'https://swapi.dev/api/movies/1',
    };
    const mockResponse = {
      "id": 6,
      "title": "string",
      "episode_id": 1,
      "opening_crawl": "string",
      "director": "string",
      "producer": "string",
      "active": true,
      "created_at": "2023-10-08T23:26:26.745Z",
      "updated_at": null,
      "release_date": "2000-10-10T00:00:00.000Z"
    };
    jest.spyOn(controller, 'createMovie').mockResolvedValue(mockResponse);

    const response = await controller.createMovie(mockMovie);
    expect(response).toEqual(mockResponse);
  });

  it('should throw a 400 code when updating a movie with invalid URL', async () => {
    const mockInvalidUrl = 'INVALID URL';
    const mockMovie = {
      title: 'Updated Movie',
      url: mockInvalidUrl,
    };
    const mockResponse = [
      false,
      {
        msg: `${mockInvalidUrl} is not valid`,
        valid_urls: [
          'https://swapi.dev/api/people/',
          'https://swapi.dev/api/planets/',
          'https://swapi.dev/api/vehicles/',
          'https://swapi.dev/api/starships/',
        ].map((item) => item + ':id'),
      },
    ];
    mockObjectInfoService.areUrlsValid.mockReturnValue(mockResponse);

    try {
      await controller.updateMovie('1', mockMovie);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.response.response).toEqual(mockResponse[1]);
      expect(error.status).toEqual(HttpStatus.BAD_REQUEST);
    }
  });

  it('should throw a 404 code when updating a movie with non-existing URL', async () => {
    const mockInvalidUrl = 'https://swapi.dev/api/people/100000';
    const mockMovie = {
      "title": "revenge of the sith 2",
      "episode_id": 1,
      "opening_crawl": "123456",
      "director": "max power",
      "producer": "homer simpson",
      "release_date": "2010-10-10T00:00:00.000Z",
      "characters": [
        {
          "url": mockInvalidUrl
        }
      ]
    };
    const mockResponse = {
      message: `${mockInvalidUrl} is not valid`,
      valid_urls: [
        "https://swapi.dev/api/people/:id",
        "https://swapi.dev/api/planets/:id",
        "https://swapi.dev/api/vehicles/:id",
        "https://swapi.dev/api/starships/:id"
      ]
    };

    jest.spyOn(mockObjectInfoService, 'getObjectInfo').mockResolvedValue(mockResponse);
    jest.spyOn(mockObjectInfoService, 'areUrlsValid').mockReturnValue([false, mockResponse]);

    try {
      await controller.updateMovie('1', mockMovie);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.response.response).toEqual(mockResponse);
      expect(error.response.status).toEqual(HttpStatus.NOT_FOUND);
    }
  });

  it('should throw a 404 code when updating a non-existing movie', async () => {
    const mockMovie = {
      title: 'Updated Movie',
      url: 'https://swapi.dev/api/movies/1',
    };
    mockMoviesService.getMovieByID.mockReturnValue(null);

    try {
      await controller.updateMovie('1', mockMovie);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.response.status).toEqual(HttpStatus.NOT_FOUND);
    }
  });

  it('should update a movie', async () => {
    const mockMovie = {
      title: 'Updated Movie',
      url: 'https://swapi.dev/api/movies/1',
    };
    const mockReturnValue = {
      id: '1',
      title: 'Updated Movie',
      url: 'https://swapi.dev/api/movies/1',
    };

    mockObjectInfoService.getObjectInfo.mockResolvedValue(true);
    mockObjectInfoService.areUrlsValid.mockReturnValue([true, null]);
    mockMoviesService.getMovieByID.mockReturnValue(mockReturnValue);
    mockMoviesService.updateMovie.mockReturnValue(mockReturnValue);

    const response = await controller.updateMovie('1', mockMovie);
    expect(response).toBe(mockReturnValue);
  });

  it('should delete a movie', async () => {
    const mockReturnValue = {
      "msg": "Movie was deleted successfully"
    };
    mockMoviesService.deleteMovieByID.mockReturnValue(mockReturnValue);
    const response = await controller.deleteMovie('1');
    expect(response).toEqual(mockReturnValue);
  });

  it('should return all characters', async () => {
    // const page = 1;
    // const mockReturnValue = {
    //   "results": [
    //     {
    //       "name": "Luke Skywalker",
    //       "height": "172",
    //       "mass": "77",
    //       "hair_color": "blond",
    //       "skin_color": "fair",
    //       "eye_color": "blue",
    //       "birth_year": "19BBY",
    //       "gender": "male",
    //       "homeworld": {
    //         "data": {
    //           "name": "Tatooine",
    //           "rotation_period": "23",
    //           "orbital_period": "304",
    //           "diameter": "10465",
    //           "climate": "arid",
    //           "gravity": "1 standard",
    //           "terrain": "desert",
    //           "surface_water": "1",
    //           "population": "200000",
    //           "created": "2014-12-09T13:50:49.641000Z",
    //           "edited": "2014-12-20T20:58:18.411000Z",
    //           "url": "https://swapi.dev/api/planets/1/"
    //         }
    //       },
    //       "vehicles": [
    //         {
    //           "data": {
    //             "name": "Snowspeeder",
    //             "model": "t-47 airspeeder",
    //             "manufacturer": "Incom corporation",
    //             "cost_in_credits": "unknown",
    //             "length": "4.5",
    //             "max_atmosphering_speed": "650",
    //             "crew": "2",
    //             "passengers": "0",
    //             "cargo_capacity": "10",
    //             "consumables": "none",
    //             "vehicle_class": "airspeeder",
    //             "created": "2014-12-15T12:22:12Z",
    //             "edited": "2014-12-20T21:30:21.672000Z",
    //             "url": "https://swapi.dev/api/vehicles/14/"
    //           }
    //         },
    //         {
    //           "data": {
    //             "name": "Imperial Speeder Bike",
    //             "model": "74-Z speeder bike",
    //             "manufacturer": "Aratech Repulsor Company",
    //             "cost_in_credits": "8000",
    //             "length": "3",
    //             "max_atmosphering_speed": "360",
    //             "crew": "1",
    //             "passengers": "1",
    //             "cargo_capacity": "4",
    //             "consumables": "1 day",
    //             "vehicle_class": "speeder",
    //             "created": "2014-12-18T11:20:04.625000Z",
    //             "edited": "2014-12-20T21:30:21.693000Z",
    //             "url": "https://swapi.dev/api/vehicles/30/"
    //           }
    //         }
    //       ],
    //       "starships": [
    //         {
    //           "data": {
    //             "name": "X-wing",
    //             "model": "T-65 X-wing",
    //             "manufacturer": "Incom Corporation",
    //             "cost_in_credits": "149999",
    //             "length": "12.5",
    //             "max_atmosphering_speed": "1050",
    //             "crew": "1",
    //             "passengers": "0",
    //             "cargo_capacity": "110",
    //             "consumables": "1 week",
    //             "hyperdrive_rating": "1.0",
    //             "MGLT": "100",
    //             "starship_class": "Starfighter",
    //             "created": "2014-12-12T11:19:05.340000Z",
    //             "edited": "2014-12-20T21:23:49.886000Z",
    //             "url": "https://swapi.dev/api/starships/12/"
    //           }
    //         },
    //         {
    //           "data": {
    //             "name": "Imperial shuttle",
    //             "model": "Lambda-class T-4a shuttle",
    //             "manufacturer": "Sienar Fleet Systems",
    //             "cost_in_credits": "240000",
    //             "length": "20",
    //             "max_atmosphering_speed": "850",
    //             "crew": "6",
    //             "passengers": "20",
    //             "cargo_capacity": "80000",
    //             "consumables": "2 months",
    //             "hyperdrive_rating": "1.0",
    //             "MGLT": "50",
    //             "starship_class": "Armed government transport",
    //             "created": "2014-12-15T13:04:47.235000Z",
    //             "edited": "2014-12-20T21:23:49.900000Z",
    //             "url": "https://swapi.dev/api/starships/22/"
    //           }
    //         }
    //       ],
    //       "created": "2014-12-09T13:50:51.644000Z",
    //       "edited": "2014-12-20T21:17:56.891000Z",
    //       "url": "https://swapi.dev/api/people/1/"
    //     },
    //     {
    //       "name": "C-3PO",
    //       "height": "167",
    //       "mass": "75",
    //       "hair_color": "n/a",
    //       "skin_color": "gold",
    //       "eye_color": "yellow",
    //       "birth_year": "112BBY",
    //       "gender": "n/a",
    //       "homeworld": {
    //         "data": {
    //           "name": "Tatooine",
    //           "rotation_period": "23",
    //           "orbital_period": "304",
    //           "diameter": "10465",
    //           "climate": "arid",
    //           "gravity": "1 standard",
    //           "terrain": "desert",
    //           "surface_water": "1",
    //           "population": "200000",
    //           "created": "2014-12-09T13:50:49.641000Z",
    //           "edited": "2014-12-20T20:58:18.411000Z",
    //           "url": "https://swapi.dev/api/planets/1/"
    //         }
    //       },
    //       "vehicles": [],
    //       "starships": [],
    //       "created": "2014-12-10T15:10:51.357000Z",
    //       "edited": "2014-12-20T21:17:50.309000Z",
    //       "url": "https://swapi.dev/api/people/2/"
    //     },
    //     {
    //       "name": "R2-D2",
    //       "height": "96",
    //       "mass": "32",
    //       "hair_color": "n/a",
    //       "skin_color": "white, blue",
    //       "eye_color": "red",
    //       "birth_year": "33BBY",
    //       "gender": "n/a",
    //       "homeworld": {
    //         "data": {
    //           "name": "Naboo",
    //           "rotation_period": "26",
    //           "orbital_period": "312",
    //           "diameter": "12120",
    //           "climate": "temperate",
    //           "gravity": "1 standard",
    //           "terrain": "grassy hills, swamps, forests, mountains",
    //           "surface_water": "12",
    //           "population": "4500000000",
    //           "created": "2014-12-10T11:52:31.066000Z",
    //           "edited": "2014-12-20T20:58:18.430000Z",
    //           "url": "https://swapi.dev/api/planets/8/"
    //         }
    //       },
    //       "vehicles": [],
    //       "starships": [],
    //       "created": "2014-12-10T15:11:50.376000Z",
    //       "edited": "2014-12-20T21:17:50.311000Z",
    //       "url": "https://swapi.dev/api/people/3/"
    //     },
    //     {
    //       "name": "Darth Vader",
    //       "height": "202",
    //       "mass": "136",
    //       "hair_color": "none",
    //       "skin_color": "white",
    //       "eye_color": "yellow",
    //       "birth_year": "41.9BBY",
    //       "gender": "male",
    //       "homeworld": {
    //         "data": {
    //           "name": "Tatooine",
    //           "rotation_period": "23",
    //           "orbital_period": "304",
    //           "diameter": "10465",
    //           "climate": "arid",
    //           "gravity": "1 standard",
    //           "terrain": "desert",
    //           "surface_water": "1",
    //           "population": "200000",
    //           "created": "2014-12-09T13:50:49.641000Z",
    //           "edited": "2014-12-20T20:58:18.411000Z",
    //           "url": "https://swapi.dev/api/planets/1/"
    //         }
    //       },
    //       "vehicles": [],
    //       "starships": [
    //         {
    //           "data": {
    //             "name": "TIE Advanced x1",
    //             "model": "Twin Ion Engine Advanced x1",
    //             "manufacturer": "Sienar Fleet Systems",
    //             "cost_in_credits": "unknown",
    //             "length": "9.2",
    //             "max_atmosphering_speed": "1200",
    //             "crew": "1",
    //             "passengers": "0",
    //             "cargo_capacity": "150",
    //             "consumables": "5 days",
    //             "hyperdrive_rating": "1.0",
    //             "MGLT": "105",
    //             "starship_class": "Starfighter",
    //             "created": "2014-12-12T11:21:32.991000Z",
    //             "edited": "2014-12-20T21:23:49.889000Z",
    //             "url": "https://swapi.dev/api/starships/13/"
    //           }
    //         }
    //       ],
    //       "created": "2014-12-10T15:18:20.704000Z",
    //       "edited": "2014-12-20T21:17:50.313000Z",
    //       "url": "https://swapi.dev/api/people/4/"
    //     },
    //     {
    //       "name": "Leia Organa",
    //       "height": "150",
    //       "mass": "49",
    //       "hair_color": "brown",
    //       "skin_color": "light",
    //       "eye_color": "brown",
    //       "birth_year": "19BBY",
    //       "gender": "female",
    //       "homeworld": {
    //         "data": {
    //           "name": "Alderaan",
    //           "rotation_period": "24",
    //           "orbital_period": "364",
    //           "diameter": "12500",
    //           "climate": "temperate",
    //           "gravity": "1 standard",
    //           "terrain": "grasslands, mountains",
    //           "surface_water": "40",
    //           "population": "2000000000",
    //           "created": "2014-12-10T11:35:48.479000Z",
    //           "edited": "2014-12-20T20:58:18.420000Z",
    //           "url": "https://swapi.dev/api/planets/2/"
    //         }
    //       },
    //       "vehicles": [
    //         {
    //           "data": {
    //             "name": "Imperial Speeder Bike",
    //             "model": "74-Z speeder bike",
    //             "manufacturer": "Aratech Repulsor Company",
    //             "cost_in_credits": "8000",
    //             "length": "3",
    //             "max_atmosphering_speed": "360",
    //             "crew": "1",
    //             "passengers": "1",
    //             "cargo_capacity": "4",
    //             "consumables": "1 day",
    //             "vehicle_class": "speeder",
    //             "created": "2014-12-18T11:20:04.625000Z",
    //             "edited": "2014-12-20T21:30:21.693000Z",
    //             "url": "https://swapi.dev/api/vehicles/30/"
    //           }
    //         }
    //       ],
    //       "starships": [],
    //       "created": "2014-12-10T15:20:09.791000Z",
    //       "edited": "2014-12-20T21:17:50.315000Z",
    //       "url": "https://swapi.dev/api/people/5/"
    //     },
    //     {
    //       "name": "Owen Lars",
    //       "height": "178",
    //       "mass": "120",
    //       "hair_color": "brown, grey",
    //       "skin_color": "light",
    //       "eye_color": "blue",
    //       "birth_year": "52BBY",
    //       "gender": "male",
    //       "homeworld": {
    //         "data": {
    //           "name": "Tatooine",
    //           "rotation_period": "23",
    //           "orbital_period": "304",
    //           "diameter": "10465",
    //           "climate": "arid",
    //           "gravity": "1 standard",
    //           "terrain": "desert",
    //           "surface_water": "1",
    //           "population": "200000",
    //           "created": "2014-12-09T13:50:49.641000Z",
    //           "edited": "2014-12-20T20:58:18.411000Z",
    //           "url": "https://swapi.dev/api/planets/1/"
    //         }
    //       },
    //       "vehicles": [],
    //       "starships": [],
    //       "created": "2014-12-10T15:52:14.024000Z",
    //       "edited": "2014-12-20T21:17:50.317000Z",
    //       "url": "https://swapi.dev/api/people/6/"
    //     },
    //     {
    //       "name": "Beru Whitesun lars",
    //       "height": "165",
    //       "mass": "75",
    //       "hair_color": "brown",
    //       "skin_color": "light",
    //       "eye_color": "blue",
    //       "birth_year": "47BBY",
    //       "gender": "female",
    //       "homeworld": {
    //         "data": {
    //           "name": "Tatooine",
    //           "rotation_period": "23",
    //           "orbital_period": "304",
    //           "diameter": "10465",
    //           "climate": "arid",
    //           "gravity": "1 standard",
    //           "terrain": "desert",
    //           "surface_water": "1",
    //           "population": "200000",
    //           "created": "2014-12-09T13:50:49.641000Z",
    //           "edited": "2014-12-20T20:58:18.411000Z",
    //           "url": "https://swapi.dev/api/planets/1/"
    //         }
    //       },
    //       "vehicles": [],
    //       "starships": [],
    //       "created": "2014-12-10T15:53:41.121000Z",
    //       "edited": "2014-12-20T21:17:50.319000Z",
    //       "url": "https://swapi.dev/api/people/7/"
    //     },
    //     {
    //       "name": "R5-D4",
    //       "height": "97",
    //       "mass": "32",
    //       "hair_color": "n/a",
    //       "skin_color": "white, red",
    //       "eye_color": "red",
    //       "birth_year": "unknown",
    //       "gender": "n/a",
    //       "homeworld": {
    //         "data": {
    //           "name": "Tatooine",
    //           "rotation_period": "23",
    //           "orbital_period": "304",
    //           "diameter": "10465",
    //           "climate": "arid",
    //           "gravity": "1 standard",
    //           "terrain": "desert",
    //           "surface_water": "1",
    //           "population": "200000",
    //           "created": "2014-12-09T13:50:49.641000Z",
    //           "edited": "2014-12-20T20:58:18.411000Z",
    //           "url": "https://swapi.dev/api/planets/1/"
    //         }
    //       },
    //       "vehicles": [],
    //       "starships": [],
    //       "created": "2014-12-10T15:57:50.959000Z",
    //       "edited": "2014-12-20T21:17:50.321000Z",
    //       "url": "https://swapi.dev/api/people/8/"
    //     },
    //     {
    //       "name": "Biggs Darklighter",
    //       "height": "183",
    //       "mass": "84",
    //       "hair_color": "black",
    //       "skin_color": "light",
    //       "eye_color": "brown",
    //       "birth_year": "24BBY",
    //       "gender": "male",
    //       "homeworld": {
    //         "data": {
    //           "name": "Tatooine",
    //           "rotation_period": "23",
    //           "orbital_period": "304",
    //           "diameter": "10465",
    //           "climate": "arid",
    //           "gravity": "1 standard",
    //           "terrain": "desert",
    //           "surface_water": "1",
    //           "population": "200000",
    //           "created": "2014-12-09T13:50:49.641000Z",
    //           "edited": "2014-12-20T20:58:18.411000Z",
    //           "url": "https://swapi.dev/api/planets/1/"
    //         }
    //       },
    //       "vehicles": [],
    //       "starships": [
    //         {
    //           "data": {
    //             "name": "X-wing",
    //             "model": "T-65 X-wing",
    //             "manufacturer": "Incom Corporation",
    //             "cost_in_credits": "149999",
    //             "length": "12.5",
    //             "max_atmosphering_speed": "1050",
    //             "crew": "1",
    //             "passengers": "0",
    //             "cargo_capacity": "110",
    //             "consumables": "1 week",
    //             "hyperdrive_rating": "1.0",
    //             "MGLT": "100",
    //             "starship_class": "Starfighter",
    //             "created": "2014-12-12T11:19:05.340000Z",
    //             "edited": "2014-12-20T21:23:49.886000Z",
    //             "url": "https://swapi.dev/api/starships/12/"
    //           }
    //         }
    //       ],
    //       "created": "2014-12-10T15:59:50.509000Z",
    //       "edited": "2014-12-20T21:17:50.323000Z",
    //       "url": "https://swapi.dev/api/people/9/"
    //     },
    //     {
    //       "name": "Obi-Wan Kenobi",
    //       "height": "182",
    //       "mass": "77",
    //       "hair_color": "auburn, white",
    //       "skin_color": "fair",
    //       "eye_color": "blue-gray",
    //       "birth_year": "57BBY",
    //       "gender": "male",
    //       "homeworld": {
    //         "data": {
    //           "name": "Stewjon",
    //           "rotation_period": "unknown",
    //           "orbital_period": "unknown",
    //           "diameter": "0",
    //           "climate": "temperate",
    //           "gravity": "1 standard",
    //           "terrain": "grass",
    //           "surface_water": "unknown",
    //           "population": "unknown",
    //           "created": "2014-12-10T16:16:26.566000Z",
    //           "edited": "2014-12-20T20:58:18.452000Z",
    //           "url": "https://swapi.dev/api/planets/20/"
    //         }
    //       },
    //       "vehicles": [
    //         {
    //           "data": {
    //             "name": "Tribubble bongo",
    //             "model": "Tribubble bongo",
    //             "manufacturer": "Otoh Gunga Bongameken Cooperative",
    //             "cost_in_credits": "unknown",
    //             "length": "15",
    //             "max_atmosphering_speed": "85",
    //             "crew": "1",
    //             "passengers": "2",
    //             "cargo_capacity": "1600",
    //             "consumables": "unknown",
    //             "vehicle_class": "submarine",
    //             "created": "2014-12-19T17:37:37.924000Z",
    //             "edited": "2014-12-20T21:30:21.710000Z",
    //             "url": "https://swapi.dev/api/vehicles/38/"
    //           }
    //         }
    //       ],
    //       "starships": [
    //         {
    //           "data": {
    //             "name": "Jedi starfighter",
    //             "model": "Delta-7 Aethersprite-class interceptor",
    //             "manufacturer": "Kuat Systems Engineering",
    //             "cost_in_credits": "180000",
    //             "length": "8",
    //             "max_atmosphering_speed": "1150",
    //             "crew": "1",
    //             "passengers": "0",
    //             "cargo_capacity": "60",
    //             "consumables": "7 days",
    //             "hyperdrive_rating": "1.0",
    //             "MGLT": "unknown",
    //             "starship_class": "Starfighter",
    //             "created": "2014-12-20T17:35:23.906000Z",
    //             "edited": "2014-12-20T21:23:49.930000Z",
    //             "url": "https://swapi.dev/api/starships/48/"
    //           }
    //         },
    //         {
    //           "data": {
    //             "name": "Trade Federation cruiser",
    //             "model": "Providence-class carrier/destroyer",
    //             "manufacturer": "Rendili StarDrive, Free Dac Volunteers Engineering corps.",
    //             "cost_in_credits": "125000000",
    //             "length": "1088",
    //             "max_atmosphering_speed": "1050",
    //             "crew": "600",
    //             "passengers": "48247",
    //             "cargo_capacity": "50000000",
    //             "consumables": "4 years",
    //             "hyperdrive_rating": "1.5",
    //             "MGLT": "unknown",
    //             "starship_class": "capital ship",
    //             "created": "2014-12-20T19:40:21.902000Z",
    //             "edited": "2014-12-20T21:23:49.941000Z",
    //             "url": "https://swapi.dev/api/starships/59/"
    //           }
    //         },
    //         {
    //           "data": {
    //             "name": "Naboo star skiff",
    //             "model": "J-type star skiff",
    //             "manufacturer": "Theed Palace Space Vessel Engineering Corps/Nubia Star Drives, Incorporated",
    //             "cost_in_credits": "unknown",
    //             "length": "29.2",
    //             "max_atmosphering_speed": "1050",
    //             "crew": "3",
    //             "passengers": "3",
    //             "cargo_capacity": "unknown",
    //             "consumables": "unknown",
    //             "hyperdrive_rating": "0.5",
    //             "MGLT": "unknown",
    //             "starship_class": "yacht",
    //             "created": "2014-12-20T19:55:15.396000Z",
    //             "edited": "2014-12-20T21:23:49.948000Z",
    //             "url": "https://swapi.dev/api/starships/64/"
    //           }
    //         },
    //         {
    //           "data": {
    //             "name": "Jedi Interceptor",
    //             "model": "Eta-2 Actis-class light interceptor",
    //             "manufacturer": "Kuat Systems Engineering",
    //             "cost_in_credits": "320000",
    //             "length": "5.47",
    //             "max_atmosphering_speed": "1500",
    //             "crew": "1",
    //             "passengers": "0",
    //             "cargo_capacity": "60",
    //             "consumables": "2 days",
    //             "hyperdrive_rating": "1.0",
    //             "MGLT": "unknown",
    //             "starship_class": "starfighter",
    //             "created": "2014-12-20T19:56:57.468000Z",
    //             "edited": "2014-12-20T21:23:49.951000Z",
    //             "url": "https://swapi.dev/api/starships/65/"
    //           }
    //         },
    //         {
    //           "data": {
    //             "name": "Belbullab-22 starfighter",
    //             "model": "Belbullab-22 starfighter",
    //             "manufacturer": "Feethan Ottraw Scalable Assemblies",
    //             "cost_in_credits": "168000",
    //             "length": "6.71",
    //             "max_atmosphering_speed": "1100",
    //             "crew": "1",
    //             "passengers": "0",
    //             "cargo_capacity": "140",
    //             "consumables": "7 days",
    //             "hyperdrive_rating": "6",
    //             "MGLT": "unknown",
    //             "starship_class": "starfighter",
    //             "created": "2014-12-20T20:38:05.031000Z",
    //             "edited": "2014-12-20T21:23:49.959000Z",
    //             "url": "https://swapi.dev/api/starships/74/"
    //           }
    //         }
    //       ],
    //       "created": "2014-12-10T16:16:29.192000Z",
    //       "edited": "2014-12-20T21:17:50.325000Z",
    //       "url": "https://swapi.dev/api/people/10/"
    //     }
    //   ],
    //   "total_records": 82,
    //   "row_count": 10,
    //   "page": page
    // };
    // mockCharactersService.charactersService.mockReturnValue(mockReturnValue);
    // const response = await controller.getAllCharacters(page, undefined);
    // expect(response).toEqual(mockReturnValue);
  });

  it('should return all planets', async () => {
    const mockResponse = {
      "results": [
        {
          "name": "Tatooine",
          "rotation_period": "23",
          "orbital_period": "304",
          "diameter": "10465",
          "climate": "arid",
          "gravity": "1 standard",
          "terrain": "desert",
          "surface_water": "1",
          "population": "200000",
          "created": "2014-12-09T13:50:49.641000Z",
          "edited": "2014-12-20T20:58:18.411000Z",
          "url": "https://swapi.dev/api/planets/1/"
        },
        {
          "name": "Hoth",
          "rotation_period": "23",
          "orbital_period": "549",
          "diameter": "7200",
          "climate": "frozen",
          "gravity": "1.1 standard",
          "terrain": "tundra, ice caves, mountain ranges",
          "surface_water": "100",
          "population": "unknown",
          "created": "2014-12-10T11:39:13.934000Z",
          "edited": "2014-12-20T20:58:18.423000Z",
          "url": "https://swapi.dev/api/planets/4/"
        },
        {
          "name": "Coruscant",
          "rotation_period": "24",
          "orbital_period": "368",
          "diameter": "12240",
          "climate": "temperate",
          "gravity": "1 standard",
          "terrain": "cityscape, mountains",
          "surface_water": "unknown",
          "population": "1000000000000",
          "created": "2014-12-10T11:54:13.921000Z",
          "edited": "2014-12-20T20:58:18.432000Z",
          "url": "https://swapi.dev/api/planets/9/"
        },
        {
          "name": "Utapau",
          "rotation_period": "27",
          "orbital_period": "351",
          "diameter": "12900",
          "climate": "temperate, arid, windy",
          "gravity": "1 standard",
          "terrain": "scrublands, savanna, canyons, sinkholes",
          "surface_water": "0.9",
          "population": "95000000",
          "created": "2014-12-10T12:49:01.491000Z",
          "edited": "2014-12-20T20:58:18.439000Z",
          "url": "https://swapi.dev/api/planets/12/"
        },
        {
          "name": "Mustafar",
          "rotation_period": "36",
          "orbital_period": "412",
          "diameter": "4200",
          "climate": "hot",
          "gravity": "1 standard",
          "terrain": "volcanoes, lava rivers, mountains, caves",
          "surface_water": "0",
          "population": "20000",
          "created": "2014-12-10T12:50:16.526000Z",
          "edited": "2014-12-20T20:58:18.440000Z",
          "url": "https://swapi.dev/api/planets/13/"
        },
        {
          "name": "Mygeeto",
          "rotation_period": "12",
          "orbital_period": "167",
          "diameter": "10088",
          "climate": "frigid",
          "gravity": "1 standard",
          "terrain": "glaciers, mountains, ice canyons",
          "surface_water": "unknown",
          "population": "19000000",
          "created": "2014-12-10T13:43:39.139000Z",
          "edited": "2014-12-20T20:58:18.446000Z",
          "url": "https://swapi.dev/api/planets/16/"
        },
        {
          "name": "Cato Neimoidia",
          "rotation_period": "25",
          "orbital_period": "278",
          "diameter": "0",
          "climate": "temperate, moist",
          "gravity": "1 standard",
          "terrain": "mountains, fields, forests, rock arches",
          "surface_water": "unknown",
          "population": "10000000",
          "created": "2014-12-10T13:46:28.704000Z",
          "edited": "2014-12-20T20:58:18.449000Z",
          "url": "https://swapi.dev/api/planets/18/"
        },
        {
          "name": "Stewjon",
          "rotation_period": "unknown",
          "orbital_period": "unknown",
          "diameter": "0",
          "climate": "temperate",
          "gravity": "1 standard",
          "terrain": "grass",
          "surface_water": "unknown",
          "population": "unknown",
          "created": "2014-12-10T16:16:26.566000Z",
          "edited": "2014-12-20T20:58:18.452000Z",
          "url": "https://swapi.dev/api/planets/20/"
        },
        {
          "name": "Nal Hutta",
          "rotation_period": "87",
          "orbital_period": "413",
          "diameter": "12150",
          "climate": "temperate",
          "gravity": "1 standard",
          "terrain": "urban, oceans, swamps, bogs",
          "surface_water": "unknown",
          "population": "7000000000",
          "created": "2014-12-10T17:11:29.452000Z",
          "edited": "2014-12-20T20:58:18.460000Z",
          "url": "https://swapi.dev/api/planets/24/"
        },
        {
          "name": "Dantooine",
          "rotation_period": "25",
          "orbital_period": "378",
          "diameter": "9830",
          "climate": "temperate",
          "gravity": "1 standard",
          "terrain": "oceans, savannas, mountains, grasslands",
          "surface_water": "unknown",
          "population": "1000",
          "created": "2014-12-10T17:23:29.896000Z",
          "edited": "2014-12-20T20:58:18.461000Z",
          "url": "https://swapi.dev/api/planets/25/"
        }
      ],
      "total_records": 24,
      "row_count": 10,
      "page": 1
    };
    jest.spyOn(controller, "returnFlatResults").mockResolvedValue(mockResponse);
    const response = await controller.getAllPlanets(1, undefined);
    expect(response).toEqual(mockResponse);
  });

  it('should return all starships', async () => {
    const mockResponse = {
      "results": [
        {
          "name": "Slave 1",
          "model": "Firespray-31-class patrol and attack",
          "manufacturer": "Kuat Systems Engineering",
          "cost_in_credits": "unknown",
          "length": "21.5",
          "max_atmosphering_speed": "1000",
          "crew": "1",
          "passengers": "6",
          "cargo_capacity": "70000",
          "consumables": "1 month",
          "hyperdrive_rating": "3.0",
          "MGLT": "70",
          "starship_class": "Patrol craft",
          "created": "2014-12-15T13:00:56.332000Z",
          "edited": "2014-12-20T21:23:49.897000Z",
          "url": "https://swapi.dev/api/starships/21/"
        },
        {
          "name": "Imperial shuttle",
          "model": "Lambda-class T-4a shuttle",
          "manufacturer": "Sienar Fleet Systems",
          "cost_in_credits": "240000",
          "length": "20",
          "max_atmosphering_speed": "850",
          "crew": "6",
          "passengers": "20",
          "cargo_capacity": "80000",
          "consumables": "2 months",
          "hyperdrive_rating": "1.0",
          "MGLT": "50",
          "starship_class": "Armed government transport",
          "created": "2014-12-15T13:04:47.235000Z",
          "edited": "2014-12-20T21:23:49.900000Z",
          "url": "https://swapi.dev/api/starships/22/"
        },
        {
          "name": "EF76 Nebulon-B escort frigate",
          "model": "EF76 Nebulon-B escort frigate",
          "manufacturer": "Kuat Drive Yards",
          "cost_in_credits": "8500000",
          "length": "300",
          "max_atmosphering_speed": "800",
          "crew": "854",
          "passengers": "75",
          "cargo_capacity": "6000000",
          "consumables": "2 years",
          "hyperdrive_rating": "2.0",
          "MGLT": "40",
          "starship_class": "Escort ship",
          "created": "2014-12-15T13:06:30.813000Z",
          "edited": "2014-12-20T21:23:49.902000Z",
          "url": "https://swapi.dev/api/starships/23/"
        },
        {
          "name": "Calamari Cruiser",
          "model": "MC80 Liberty type Star Cruiser",
          "manufacturer": "Mon Calamari shipyards",
          "cost_in_credits": "104000000",
          "length": "1200",
          "max_atmosphering_speed": "n/a",
          "crew": "5400",
          "passengers": "1200",
          "cargo_capacity": "unknown",
          "consumables": "2 years",
          "hyperdrive_rating": "1.0",
          "MGLT": "60",
          "starship_class": "Star Cruiser",
          "created": "2014-12-18T10:54:57.804000Z",
          "edited": "2014-12-20T21:23:49.904000Z",
          "url": "https://swapi.dev/api/starships/27/"
        },
        {
          "name": "A-wing",
          "model": "RZ-1 A-wing Interceptor",
          "manufacturer": "Alliance Underground Engineering, Incom Corporation",
          "cost_in_credits": "175000",
          "length": "9.6",
          "max_atmosphering_speed": "1300",
          "crew": "1",
          "passengers": "0",
          "cargo_capacity": "40",
          "consumables": "1 week",
          "hyperdrive_rating": "1.0",
          "MGLT": "120",
          "starship_class": "Starfighter",
          "created": "2014-12-18T11:16:34.542000Z",
          "edited": "2014-12-20T21:23:49.907000Z",
          "url": "https://swapi.dev/api/starships/28/"
        },
        {
          "name": "B-wing",
          "model": "A/SF-01 B-wing starfighter",
          "manufacturer": "Slayn & Korpil",
          "cost_in_credits": "220000",
          "length": "16.9",
          "max_atmosphering_speed": "950",
          "crew": "1",
          "passengers": "0",
          "cargo_capacity": "45",
          "consumables": "1 week",
          "hyperdrive_rating": "2.0",
          "MGLT": "91",
          "starship_class": "Assault Starfighter",
          "created": "2014-12-18T11:18:04.763000Z",
          "edited": "2014-12-20T21:23:49.909000Z",
          "url": "https://swapi.dev/api/starships/29/"
        },
        {
          "name": "Republic Cruiser",
          "model": "Consular-class cruiser",
          "manufacturer": "Corellian Engineering Corporation",
          "cost_in_credits": "unknown",
          "length": "115",
          "max_atmosphering_speed": "900",
          "crew": "9",
          "passengers": "16",
          "cargo_capacity": "unknown",
          "consumables": "unknown",
          "hyperdrive_rating": "2.0",
          "MGLT": "unknown",
          "starship_class": "Space cruiser",
          "created": "2014-12-19T17:01:31.488000Z",
          "edited": "2014-12-20T21:23:49.912000Z",
          "url": "https://swapi.dev/api/starships/31/"
        },
        {
          "name": "Droid control ship",
          "model": "Lucrehulk-class Droid Control Ship",
          "manufacturer": "Hoersch-Kessel Drive, Inc.",
          "cost_in_credits": "unknown",
          "length": "3170",
          "max_atmosphering_speed": "n/a",
          "crew": "175",
          "passengers": "139000",
          "cargo_capacity": "4000000000",
          "consumables": "500 days",
          "hyperdrive_rating": "2.0",
          "MGLT": "unknown",
          "starship_class": "Droid control ship",
          "created": "2014-12-19T17:04:06.323000Z",
          "edited": "2014-12-20T21:23:49.915000Z",
          "url": "https://swapi.dev/api/starships/32/"
        },
        {
          "name": "Naboo fighter",
          "model": "N-1 starfighter",
          "manufacturer": "Theed Palace Space Vessel Engineering Corps",
          "cost_in_credits": "200000",
          "length": "11",
          "max_atmosphering_speed": "1100",
          "crew": "1",
          "passengers": "0",
          "cargo_capacity": "65",
          "consumables": "7 days",
          "hyperdrive_rating": "1.0",
          "MGLT": "unknown",
          "starship_class": "Starfighter",
          "created": "2014-12-19T17:39:17.582000Z",
          "edited": "2014-12-20T21:23:49.917000Z",
          "url": "https://swapi.dev/api/starships/39/"
        },
        {
          "name": "Naboo Royal Starship",
          "model": "J-type 327 Nubian royal starship",
          "manufacturer": "Theed Palace Space Vessel Engineering Corps, Nubia Star Drives",
          "cost_in_credits": "unknown",
          "length": "76",
          "max_atmosphering_speed": "920",
          "crew": "8",
          "passengers": "unknown",
          "cargo_capacity": "unknown",
          "consumables": "unknown",
          "hyperdrive_rating": "1.8",
          "MGLT": "unknown",
          "starship_class": "yacht",
          "created": "2014-12-19T17:45:03.506000Z",
          "edited": "2014-12-20T21:23:49.919000Z",
          "url": "https://swapi.dev/api/starships/40/"
        }
      ],
      "total_records": 36,
      "row_count": 10,
      "page": 2
    };
    jest.spyOn(controller, "returnFlatResults").mockResolvedValue(mockResponse);
    const response = await controller.getAllStarships(1, undefined);
    expect(response).toEqual(mockResponse);
  });

  it('should return all vehicles', async () => {
    const mockResponse = {
      "results": [
        {
          "name": "Sand Crawler",
          "model": "Digger Crawler",
          "manufacturer": "Corellia Mining Corporation",
          "cost_in_credits": "150000",
          "length": "36.8 ",
          "max_atmosphering_speed": "30",
          "crew": "46",
          "passengers": "30",
          "cargo_capacity": "50000",
          "consumables": "2 months",
          "vehicle_class": "wheeled",
          "created": "2014-12-10T15:36:25.724000Z",
          "edited": "2014-12-20T21:30:21.661000Z",
          "url": "https://swapi.dev/api/vehicles/4/"
        },
        {
          "name": "T-16 skyhopper",
          "model": "T-16 skyhopper",
          "manufacturer": "Incom Corporation",
          "cost_in_credits": "14500",
          "length": "10.4 ",
          "max_atmosphering_speed": "1200",
          "crew": "1",
          "passengers": "1",
          "cargo_capacity": "50",
          "consumables": "0",
          "vehicle_class": "repulsorcraft",
          "created": "2014-12-10T16:01:52.434000Z",
          "edited": "2014-12-20T21:30:21.665000Z",
          "url": "https://swapi.dev/api/vehicles/6/"
        },
        {
          "name": "X-34 landspeeder",
          "model": "X-34 landspeeder",
          "manufacturer": "SoroSuub Corporation",
          "cost_in_credits": "10550",
          "length": "3.4 ",
          "max_atmosphering_speed": "250",
          "crew": "1",
          "passengers": "1",
          "cargo_capacity": "5",
          "consumables": "unknown",
          "vehicle_class": "repulsorcraft",
          "created": "2014-12-10T16:13:52.586000Z",
          "edited": "2014-12-20T21:30:21.668000Z",
          "url": "https://swapi.dev/api/vehicles/7/"
        },
        {
          "name": "TIE/LN starfighter",
          "model": "Twin Ion Engine/Ln Starfighter",
          "manufacturer": "Sienar Fleet Systems",
          "cost_in_credits": "unknown",
          "length": "6.4",
          "max_atmosphering_speed": "1200",
          "crew": "1",
          "passengers": "0",
          "cargo_capacity": "65",
          "consumables": "2 days",
          "vehicle_class": "starfighter",
          "created": "2014-12-10T16:33:52.860000Z",
          "edited": "2014-12-20T21:30:21.670000Z",
          "url": "https://swapi.dev/api/vehicles/8/"
        },
        {
          "name": "Snowspeeder",
          "model": "t-47 airspeeder",
          "manufacturer": "Incom corporation",
          "cost_in_credits": "unknown",
          "length": "4.5",
          "max_atmosphering_speed": "650",
          "crew": "2",
          "passengers": "0",
          "cargo_capacity": "10",
          "consumables": "none",
          "vehicle_class": "airspeeder",
          "created": "2014-12-15T12:22:12Z",
          "edited": "2014-12-20T21:30:21.672000Z",
          "url": "https://swapi.dev/api/vehicles/14/"
        },
        {
          "name": "TIE bomber",
          "model": "TIE/sa bomber",
          "manufacturer": "Sienar Fleet Systems",
          "cost_in_credits": "unknown",
          "length": "7.8",
          "max_atmosphering_speed": "850",
          "crew": "1",
          "passengers": "0",
          "cargo_capacity": "none",
          "consumables": "2 days",
          "vehicle_class": "space/planetary bomber",
          "created": "2014-12-15T12:33:15.838000Z",
          "edited": "2014-12-20T21:30:21.675000Z",
          "url": "https://swapi.dev/api/vehicles/16/"
        },
        {
          "name": "AT-AT",
          "model": "All Terrain Armored Transport",
          "manufacturer": "Kuat Drive Yards, Imperial Department of Military Research",
          "cost_in_credits": "unknown",
          "length": "20",
          "max_atmosphering_speed": "60",
          "crew": "5",
          "passengers": "40",
          "cargo_capacity": "1000",
          "consumables": "unknown",
          "vehicle_class": "assault walker",
          "created": "2014-12-15T12:38:25.937000Z",
          "edited": "2014-12-20T21:30:21.677000Z",
          "url": "https://swapi.dev/api/vehicles/18/"
        },
        {
          "name": "AT-ST",
          "model": "All Terrain Scout Transport",
          "manufacturer": "Kuat Drive Yards, Imperial Department of Military Research",
          "cost_in_credits": "unknown",
          "length": "2",
          "max_atmosphering_speed": "90",
          "crew": "2",
          "passengers": "0",
          "cargo_capacity": "200",
          "consumables": "none",
          "vehicle_class": "walker",
          "created": "2014-12-15T12:46:42.384000Z",
          "edited": "2014-12-20T21:30:21.679000Z",
          "url": "https://swapi.dev/api/vehicles/19/"
        },
        {
          "name": "Storm IV Twin-Pod cloud car",
          "model": "Storm IV Twin-Pod",
          "manufacturer": "Bespin Motors",
          "cost_in_credits": "75000",
          "length": "7",
          "max_atmosphering_speed": "1500",
          "crew": "2",
          "passengers": "0",
          "cargo_capacity": "10",
          "consumables": "1 day",
          "vehicle_class": "repulsorcraft",
          "created": "2014-12-15T12:58:50.530000Z",
          "edited": "2014-12-20T21:30:21.681000Z",
          "url": "https://swapi.dev/api/vehicles/20/"
        },
        {
          "name": "Sail barge",
          "model": "Modified Luxury Sail Barge",
          "manufacturer": "Ubrikkian Industries Custom Vehicle Division",
          "cost_in_credits": "285000",
          "length": "30",
          "max_atmosphering_speed": "100",
          "crew": "26",
          "passengers": "500",
          "cargo_capacity": "2000000",
          "consumables": "Live food tanks",
          "vehicle_class": "sail barge",
          "created": "2014-12-18T10:44:14.217000Z",
          "edited": "2014-12-20T21:30:21.684000Z",
          "url": "https://swapi.dev/api/vehicles/24/"
        }
      ],
      "total_records": 39,
      "row_count": 10,
      "page": 1
    };
    jest.spyOn(controller, "returnFlatResults").mockResolvedValue(mockResponse);
    const response = await controller.getAllVehicles(1, undefined);
    expect(response).toEqual(mockResponse);
  });

  it('returnFlatResults helper', async () => {
    const page = 0;
    const mockResponse = {
      data: {
        results: [
          "hello im the response!"
        ],
        count: 1,
        page: page
      }
    };
    mockObjectInfoService.getObjectInfo.mockResolvedValue(mockResponse);

    const response = await controller.returnFlatResults(undefined, page);
    expect(response).toEqual({
      results: [
        "hello im the response!"
      ],
      total_records: 1,
      row_count: 1,
      page: page
    });
  });
});
