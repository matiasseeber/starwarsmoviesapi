import { Injectable } from '@nestjs/common';
import { connection } from 'src/configs/connection';

@Injectable()
export class LoginService {
    async insertLogin(user_id: number, refresh_token: string){
        return connection.logins.create({
            data: {
                user_id,
                refresh_token
            }
        })
    }
}
