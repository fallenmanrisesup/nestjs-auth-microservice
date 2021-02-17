import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { JwtService } from '../jwt/jwt.service';
import { IRequest } from '../core/extensions';

export const X_USER_HEADER = 'x-user';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: IRequest, _: Response, next: NextFunction) {
    if (req.headers[X_USER_HEADER]) {
      const json = Buffer.from(req.headers[X_USER_HEADER]).toString('utf-8');
      req.user = JSON.parse(json);
      return next();
    }

    const { authorization } = req.headers;

    if (authorization) {
      const [, token] = authorization.split('Bearer ');
      const decoded = await this.jwtService.verifyAccessToken(token);
      req.user = decoded;
    }

    return next();
  }
}
