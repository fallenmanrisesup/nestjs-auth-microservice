import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { JwtService } from '../jwt/jwt.service';
import { IRequest } from '../core/extensions';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: IRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    const [, token] = authHeader.split('Bearer ');

    if (token) {
      const decoded = await this.jwtService.verifyAccessToken(token);
      req.user = decoded;
    }

    return next();
  }
}
