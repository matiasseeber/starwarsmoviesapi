import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import { User } from './types/user';

declare global {
  namespace Express {
    interface Request {
      decoded?: User;
      token?: string;
    }
  }
}

const PORT = process.env.PORT || 8080;

async function bootstrap() {
  ConfigModule.forRoot();

  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
  console.log(`Application running on port ${PORT}`)
}

bootstrap();
