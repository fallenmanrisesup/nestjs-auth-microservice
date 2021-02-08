import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IJwtClaims, ITokenClaims } from './interfaces/jwt-claims';
import * as jwt from 'jsonwebtoken';
import { IConfigProps } from '../config';
import { InvalidJwtException } from './excpetions/invalid-jwt.exception';
import { ITokenResult } from './interfaces/token-result';

@Injectable()
export class JwtService {
  private logger = new Logger(JwtService.name);

  constructor(private readonly configService: ConfigService) {}

  async createAccessToken(claims: IJwtClaims): Promise<ITokenResult> {
    const { secret, accessExpires } = this.configService.get<
      IConfigProps['jwt']
    >('jwt');

    const token = jwt.sign({ ...claims }, secret, {
      expiresIn: +accessExpires,
    });

    const expires = new Date().getTime() + Number(accessExpires);

    return { token, expires: new Date(expires) };
  }
  async createRefreshToken(claims: ITokenClaims): Promise<ITokenResult> {
    const { secret, refreshExpires } = this.configService.get<
      IConfigProps['jwt']
    >('jwt');

    const token = jwt.sign({ ...claims }, secret, {
      expiresIn: +refreshExpires,
    });
    const expires = new Date().getTime() + Number(refreshExpires);

    return { token, expires: new Date(expires) };
  }

  verifyAccessToken(token: string): Promise<IJwtClaims> {
    const { secret } = this.configService.get<IConfigProps['jwt']>('jwt');

    return new Promise((resolve, reject) =>
      jwt.verify(token, secret, {}, (err, decoded) => {
        if (err) {
        }
        return err
          ? reject(new InvalidJwtException())
          : resolve(decoded as IJwtClaims);
      }),
    );
  }

  verifyRefreshToken(token: string): Promise<ITokenClaims> {
    const { secret } = this.configService.get<IConfigProps['jwt']>('jwt');

    return new Promise((resolve, reject) =>
      jwt.verify(token, secret, {}, (err, decoded) => {
        return err
          ? reject(new InvalidJwtException())
          : resolve(decoded as ITokenClaims);
      }),
    );
  }
}
