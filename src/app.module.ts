import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './modules/movies/movies.module';
import { ConfigsModule } from './configs/configs.module';
import { UsersModule } from './modules/users/users.module';
import { UsersService } from './modules/users/users.service';
import { AuthModule } from './modules/auth/auth.module';
import { VerifyTokenMiddleware } from './middlewares/verify-token/verify-token.middleware';
import { LoginService } from './modules/login/login.service';
import { CharactersService } from './modules/characters/characters.service';
import { CheckPermissionsMiddleware } from './middlewares/check-permissions/check-permissions.middleware';

@Module({
  imports: [MoviesModule, ConfigsModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, UsersService, LoginService, CharactersService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VerifyTokenMiddleware).forRoutes('/auth/change_password', "/movies");
    consumer.apply(CheckPermissionsMiddleware).forRoutes("/movies/:id");
  }
}