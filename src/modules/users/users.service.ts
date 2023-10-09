import { Injectable } from '@nestjs/common';
import { connection } from 'configs/connection';
import { verifyEmailPayload } from 'types/auth';
import { User } from 'types/tables';
import { usersCreateInput, UserUpdateInput } from 'types/user';

@Injectable()
export class UsersService {
    async createUser(user: usersCreateInput) {
        return connection.users.create({
            data: user
        });
    }
    async isFieldvValueAlreadyTaken(filter: { username?: string, email?: string }) {
        const user: User = await connection.users.findFirst({
            where: {
                ...filter
            }
        });
        return !!user;
    }
    async getUserByEmailAndVerificationCode(where: verifyEmailPayload) {
        return connection.users.findFirst({
            where
        });
    }
    async getUserByEmail(email: string) {
        return connection.users.findFirst({
            where: {
                email
            }
        });
    }
    async getUserByID(id: number) {
        return connection.users.findFirst({
            where: {
                id
            }
        });
    }
    async updateUserByID(id: number, data: UserUpdateInput) {
        return connection.users.update({
            where: {
                id
            },
            data
        });
    }
    async updateUserByEmail(email: string, data: UserUpdateInput) {
        return connection.users.update({
            where: {
                email
            },
            data
        });
    }
    async getUserByRefreshToken(refresh_token: string) {
        return connection.users.findFirst({
            where: {
                logins: {
                    some: {
                        refresh_token,
                        created_at: { gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) }
                    }
                }
            }
        });
    }
}
