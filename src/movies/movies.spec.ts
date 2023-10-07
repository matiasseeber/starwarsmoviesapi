import { Test, TestingModule } from '@nestjs/testing';
import { Movies } from './movies.service';

describe('Movies', () => {
  let provider: Movies;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Movies],
    }).compile();

    provider = module.get<Movies>(Movies);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
