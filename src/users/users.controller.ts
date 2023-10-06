import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { User } from 'src/types/user';
import { UsersService } from './users.service';
import { EmailService } from 'src/helpers/sendEmail.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService, private readonly emailService: EmailService) { }

    @Post()
    async createUser(@Body() user: User): Promise<User> {
        user.verification_code = Math.floor(100000 + Math.random() * 900000).toString();
        const { verification_code, email, username } = user;
        //prevent user to insert password before email verification
        const userData: User = { verification_code, email, username, verification_code_sent_at: new Date() };

        if (await this.usersService.isFieldvValueAlreadyTaken({ email })) {
            throw new HttpException('Email is already taken.', HttpStatus.BAD_REQUEST);
        }

        if (await this.usersService.isFieldvValueAlreadyTaken({ username })) {
            throw new HttpException('Username is already taken.', HttpStatus.BAD_REQUEST);
        }

        const response: User = await this.usersService.createUser(userData);
        this.emailService.sendEmail(email, "Verify your account", "verifyEmailTemplate.html", { verification_code });

        //delete sensitive information
        delete response.password;
        delete response.verification_code;
        return response;
    }
}
