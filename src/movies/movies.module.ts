import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { ObjectInfoService } from 'src/helpers/objectInfo.service';
import { MoviesService } from './movies.service';

@Module({
    controllers: [MoviesController],
    providers: [ObjectInfoService, MoviesService]
})
export class MoviesModule { }
