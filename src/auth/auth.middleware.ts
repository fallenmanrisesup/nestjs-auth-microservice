import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { JwtService } from '../jwt/jwt.service';
import { IRequest } from '../core/extensions';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: IRequest, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (authorization) {
      const [, token] = authorization.split('Bearer ');
      const decoded = await this.jwtService.verifyAccessToken(token);
      req.user = decoded;
    }

    return next();
  }
}
