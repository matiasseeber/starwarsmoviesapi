import { Controller, Post, Body, HttpException, HttpStatus, Req } from '@nestjs/common';
import { changeUserPasswordBody, loginPayload, resendVerificationEmailPayload, verifyEmailPayload, verifyEmailResponse } from 'src/types/auth';
import { UsersService } from '../users/users.service';
import { sign } from "jsonwebtoken";
import { EmailService } from 'src/helpers/sendEmail.service';
import { hash, compareSync } from "bcryptjs";
import { Request } from 'express';
import { LoginService } from 'src/modules/login/login.service';
import { User } from 'src/types/tables';
import { generate } from 'randomstring';

@Controller('auth')
export class AuthController {
    constructor(private readonly usersService: UsersService, private readonly emailService: EmailService, private readonly loginService: LoginService) { }

    @Post('login')
    async login(@Body() data: loginPayload) {
        const { email, password, refresh_token } = data;

        if ((!email || !password) && !refresh_token) {
            throw new HttpException("Refresh token or User and Password fields are required.", HttpStatus.BAD_REQUEST);
        }

        const jwtDuration = `${process.env.JWT_HOURS_DURATION || 1}h`;
        const jwtOptions = {
            expiresIn: jwtDuration
        };

        const generateJWT = (user: User) => sign(user, process.env.SECRET_KEY, jwtOptions);

        if (email) {
            const user = await this.usersService.getUserByEmail(data.email);

            if (!user || !compareSync(password, user.password)) {
                throw new HttpException("No user exists with that user-password combination.", HttpStatus.UNAUTHORIZED);
            }

            delete user.password;
            delete user.verification_code;

            const token = generateJWT(user);

            const randomstring = generate(22);
            const newRefreshToken = await this.loginService.insertLogin(user.id, randomstring);

            return { token, refresh_token: newRefreshToken, user };
        }

        const user = await this.usersService.getUserByRefreshToken(refresh_token);

        if (!user) {
            throw new HttpException("The refresh token is invalid or expired.", HttpStatus.UNAUTHORIZED);
        }

        delete user.password;
        delete user.verification_code;

        const token = generateJWT(user);

        const randomstring = generate(22);
        const newRefreshToken = await this.loginService.insertLogin(user.id, randomstring);

        return { token, refresh_token: newRefreshToken, user };
    }

    @Post('verify')
    async verifyEmail(@Body() data: verifyEmailPayload): Promise<verifyEmailResponse> {
        let user = await this.usersService.getUserByEmailAndVerificationCode(data);

        if (!user) {
            throw new HttpException("Invalid username - verification code combination.", HttpStatus.NOT_FOUND);
        }

        if (user.verificated_at && user.verificated_at.getTime() > user.verification_code_sent_at.getTime()) {
            throw new HttpException("User was already verifed.", HttpStatus.BAD_REQUEST);
        }

        const { id, verification_code_sent_at } = user;
        //check if more than half an hour has passed
        if ((new Date().getTime() - new Date(verification_code_sent_at).getTime()) > 1800000) {
            throw new HttpException("The verification code is no longer valid.", HttpStatus.BAD_REQUEST);
        }

        user = await this.usersService.updateUserByID(id, {
            verificated_at: new Date()
        });

        //delete sensitive information
        delete user.password;
        delete user.verification_code;
        const token = sign(user, process.env.SECRET_KEY, {
            expiresIn: "24h"
        });
        return { token, msg: "Email verified successfully." };
    }

    @Post('change_password')
    async changeUserPassword(@Body() data: changeUserPasswordBody, @Req() req: Request) {
        if (!data.password) throw new HttpException("Password is a required property.", HttpStatus.BAD_REQUEST);
        const hashedPassword = await hash(data.password, 10);
        await this.usersService.updateUserByID(req.decoded.id, { password: hashedPassword });
        return { msg: "User password was set correctly." };
    }

    @Post('resend_verification_email')
    async resendVerificationEmail(@Body() data: resendVerificationEmailPayload) {
        const { email } = data;
        const user = await this.usersService.getUserByEmail(email);

        if (!user) {
            throw new HttpException("User with that email not found.", HttpStatus.NOT_FOUND);
        }

        const verification_code = Math.floor(100000 + Math.random() * 900000).toString();
        const updatedUser = await this.usersService.updateUserByEmail(email, { verification_code, verification_code_sent_at: new Date() });
        this.emailService.sendEmail(email, "Verify your account", "verifyEmailTemplate.html", { verification_code });

        //delete sensitive information
        delete user.password;
        delete user.verification_code;
        return updatedUser;
    }
}
