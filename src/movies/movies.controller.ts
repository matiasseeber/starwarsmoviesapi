import { Controller, Get } from '@nestjs/common';

@Controller('movies')
export class MoviesController {
    @Get()
    async findAll(): Promise<any> {

    }
}
