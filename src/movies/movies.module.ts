import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { ObjectInfoService } from 'src/helpers/objectInfo.service';

@Module({
    controllers: [MoviesController],
    providers: [ObjectInfoService]
})
export class MoviesModule { }
