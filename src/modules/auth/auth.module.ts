import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { Auth } from './auth.service';
import { UsersService } from 'modules/users/users.service';
import { EmailService } from 'helpers/sendEmail.service';
import { LoginService } from 'modules/login/login.service';

@Module({
  controllers: [AuthController],
  providers: [Auth, UsersService, EmailService, LoginService]
})
export class AuthModule {}
