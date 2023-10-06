import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AppService } from '../app.service'; // Import your app service or module here

@Injectable()
export class VerifyTokenMiddleware implements NestMiddleware {
  constructor(private readonly appService: AppService) {} // Inject your app service or module here

  use(req: Request, res: Response, next: NextFunction) {
    let token: string = req.headers['access-token']?.toString() || req.headers['authorization']?.toString() || '';

    if (!token || token.length === 0) {
      return res.status(400).json({ msg: 'The access-token is mandatory.' });
    }

    token = token.replace('Bearer ', '');

    const secretKey = process.env.SECRET_KEY;

    jwt.verify(token, secretKey, (error: any, decoded: any) => {
      if (error) {
        console.log(error);
        return res.status(401).json({ msg: 'Invalid token' });
      }
      req.decoded = decoded;
      req.token = token;
      next();
    });
  }
}
