import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { EmailService } from 'helpers/sendEmail.service';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [EmailService, UsersService]
})
export class UsersModule {}
