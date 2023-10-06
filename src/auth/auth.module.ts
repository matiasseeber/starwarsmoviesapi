import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { Auth } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/helpers/sendEmail.service';

@Module({
  controllers: [AuthController],
  providers: [Auth, UsersService, EmailService]
})
export class AuthModule {}
