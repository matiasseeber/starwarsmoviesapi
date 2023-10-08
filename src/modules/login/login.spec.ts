import { Test, TestingModule } from '@nestjs/testing';
import { LoginService } from './login.service';

describe('Login', () => {
  let provider: LoginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginService],
    }).compile();

    provider = module.get<LoginService>(LoginService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
