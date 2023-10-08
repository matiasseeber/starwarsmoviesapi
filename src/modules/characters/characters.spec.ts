import { Test, TestingModule } from '@nestjs/testing';
import { CharactersService } from './characters.service';

describe('Characters', () => {
  let provider: CharactersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CharactersService],
    }).compile();

    provider = module.get<CharactersService>(CharactersService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
