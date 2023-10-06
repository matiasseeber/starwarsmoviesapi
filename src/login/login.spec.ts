import { Test, TestingModule } from '@nestjs/testing';
import { Login } from './login.service';

describe('Login', () => {
  let provider: Login;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Login],
    }).compile();

    provider = module.get<Login>(Login);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
