import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';

import * as compression from 'compression';
import * as morgan from 'morgan';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

@Module({})
export class ConfigsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(
                compression({ filter: () => true, threshold: 0 }),
                morgan('dev'),
                cors(),
                bodyParser.raw(),
                bodyParser.text(),
                bodyParser.json({ limit: '10mb' }),
                bodyParser.urlencoded({ limit: '10mb', extended: true })
            )
            .forRoutes('*');
    }
}
