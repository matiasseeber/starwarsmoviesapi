import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';
import { ConfigsModule } from './configs/configs.module';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { AuthModule } from './auth/auth.module';
import { VerifyTokenMiddleware } from './verify-token/verify-token.middleware';
import { LoginService } from './login/login.service';

@Module({
  imports: [MoviesModule, ConfigsModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, UsersService, LoginService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyTokenMiddleware).forRoutes('/auth/change_password'); // Apply the middleware to all routes
  }
}