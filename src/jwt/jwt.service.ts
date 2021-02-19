import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IJwtClaims, ITokenClaims } from './interfaces/jwt-claims';
import * as jwt from 'jsonwebtoken';
import { IConfigProps } from '../config';
import { InvalidJwtException } from './excpetions/invalid-jwt.exception';
import { ITokenResult } from './interfaces/token-result';
import * as uuid from 'uuid';

@Injectable()
export class JwtService {
  private logger = new Logger(JwtService.name);

  constructor(private readonly configService: ConfigService) {}

  async createAccessToken({
    id,
    username,
    lang,
    email,
    phone,
  }: IJwtClaims): Promise<ITokenResult> {
    const { secret, accessExpires } = this.configService.get<
      IConfigProps['jwt']
    >('jwt');

    const token = jwt.sign({ id, username, lang, email, phone }, secret, {
      expiresIn: +accessExpires,
    });

    const expires = new Date().getTime() + Number(accessExpires);

    return { token, expires: new Date(expires) };
  }
  async createRefreshToken({ id }: ITokenClaims): Promise<ITokenResult> {
    const { secret, refreshExpires } = this.configService.get<
      IConfigProps['jwt']
    >('jwt');

    const token = jwt.sign({ id, tokid: uuid.v4() }, secret, {
      expiresIn: +refreshExpires,
    });
    const expires = new Date().getTime() + Number(refreshExpires);

    return { token, expires: new Date(expires) };
  }

  verifyAccessToken(token: string): Promise<IJwtClaims> {
    const { secret } = this.configService.get<IConfigProps['jwt']>('jwt');

    return new Promise((resolve, reject) =>
      jwt.verify(token, secret, {}, (err, decoded) => {
        if (err) this.logger.warn(err);
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
        if (err) this.logger.warn(err);
        return err
          ? reject(new InvalidJwtException())
          : resolve(decoded as ITokenClaims);
      }),
    );
  }
}
