import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { ObjectInfoService } from 'helpers/objectInfo.service';
import { moviesCreateInput } from '../../types/movies'; // Update this import if necessary
import { Movie } from 'types/tables';
import { connection } from 'configs/connection';

describe('MoviesService', () => {
  let moviesService: MoviesService;
  let objectInfoService: ObjectInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoviesService, ObjectInfoService],
    }).compile();

    moviesService = module.get<MoviesService>(MoviesService);
    objectInfoService = module.get<ObjectInfoService>(ObjectInfoService);
  });

  it('should be defined', () => {
    expect(moviesService).toBeDefined();
  });

  it('should create a movie', async () => {
    const movieData: moviesCreateInput = {
      "title": "string",
      "episode_id": 1,
      "opening_crawl": "string",
      "director": "string",
      "producer": "string",
      "release_date": "2000-10-10",
      "characters": [
        {
          "url": "https://swapi.dev/api/people/100000"
        }
      ],
      "planets": [
        {
          "url": "https://swapi.dev/api/planets/1/"
        }
      ],
      "starships": [
        {
          "url": "https://swapi.dev/api/starships/9"
        }
      ],
      "vehicles": [
        {
          "url": "https://swapi.dev/api/vehicles/4"
        }
      ]
    };
    connection.movies.create = jest.fn().mockResolvedValue(movieData);
    const result = await moviesService.createMovie(movieData);
    expect(result).toEqual(movieData);
  });

  it('should get all movies paginated', async () => {
    const page = 1;
    const search = undefined;

    const result = await moviesService.getAllPaginated(page, search);
    
    expect(typeof result.total_records).toBe("number");
    expect(typeof result.row_count).toBe("number");
    expect(typeof result.page).toBe("number");
    expect(typeof result.results).toBe("object");

    if(result.results.length > 0){
      const firstRow = result.results[0];
      expect(typeof firstRow.id).toBe("number");
      expect(typeof firstRow.title).toBe("string");
      expect(typeof firstRow.episode_id).toBe("number");
      expect(typeof firstRow.opening_crawl).toBe("string");
      expect(typeof firstRow.director).toBe("string");      
      expect(typeof firstRow.producer).toBe("string");
      expect(typeof firstRow.active).toBe("boolean");
      expect(firstRow.active).toBe(true);
      expect(typeof firstRow.created_at).toBe("object");
      expect(typeof firstRow.vehicles).toBe("object");
      expect(typeof firstRow.characters).toBe("object");
      expect(typeof firstRow.starships).toBe("object");
      expect(typeof firstRow.planets).toBe("object");
    }
  });

  it('should get a movie by ID', async () => {
    const movieId = 1;

    const result = await moviesService.getMovieByID(movieId);
  });

  it('should return null for non-existent movie', async () => {
    const movieId = 9999;

    const result = await moviesService.getMovieByID(movieId);

    expect(result).toBeNull();
  });

  it('should delete a movie by ID', async () => {
    const movieId = 1;

    const result = await moviesService.deleteMovieByID(movieId);
  });

  it('should update a movie', async () => {
    const movieId = 1;
    const movieData: Movie = {
    };

    const result = await moviesService.updateMovie(movieId, movieData);
  });
});
