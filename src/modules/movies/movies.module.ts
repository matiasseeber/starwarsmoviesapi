import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { ObjectInfoService } from 'helpers/objectInfo.service';
import { MoviesService } from './movies.service';
import { CharactersService } from 'modules/characters/characters.service';

@Module({
    controllers: [MoviesController],
    providers: [ObjectInfoService, MoviesService, CharactersService]
})
export class MoviesModule { }
