import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';

describe('Movies', () => {
  let provider: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoviesService],
    }).compile();

    provider = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
