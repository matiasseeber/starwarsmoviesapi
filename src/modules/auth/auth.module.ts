import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { Auth } from './auth.service';
import { UsersService } from 'src/modules/users/users.service';
import { EmailService } from 'src/helpers/sendEmail.service';
import { LoginService } from 'src/modules/login/login.service';

@Module({
  controllers: [AuthController],
  providers: [Auth, UsersService, EmailService, LoginService]
})
export class AuthModule {}
