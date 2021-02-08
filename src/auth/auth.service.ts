import { Injectable } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { JwtService } from '../jwt/jwt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from './entities/session.entity';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { EmailExistsException } from './excepctions/email-exists.exception';
import { ITokenPair } from './intrafeces/token-pair';
import { LoginDto } from './dtos/login.dto';
import { ISessionMeta } from './intrafeces/login-meta';
import { IncorrectCredentials } from './excepctions/incorrect-credentials.exception';
import { BadRefreshTokenException } from './excepctions/bad-refresh-token.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(SessionEntity)
    private readonly sessionsRepo: Repository<SessionEntity>,
  ) {}

  async register({ email, username, password }: RegisterDto) {
    const found = await this.userService.find({
      where: [{ email }, { username }],
    });

    if (found) {
      throw new EmailExistsException();
    }

    const pwd = await bcrypt.hash(password, 10);

    return this.userService.create({
      email,
      username,
      password: pwd,
    });
  }

  async login({
    emailOrUsername,
    password,
    deviceToken,
    agent,
    ip,
  }: LoginDto): Promise<ITokenPair> {
    const foundUser = await this.userService.findByEmailOrUsername(
      emailOrUsername,
    );

    if (!foundUser || !(await bcrypt.compare(password, foundUser.password))) {
      throw new IncorrectCredentials();
    }

    const { refreshToken } = await this.sessionsRepo.manager.transaction(
      async tx => {
        const prevSessions = await this.sessionsRepo.find({
          where: { agent, deviceToken },
        });

        await tx.remove<SessionEntity>(prevSessions);

        const { token, expires } = await this.jwtService.createRefreshToken({
          id: foundUser.id,
        });

        const session = this.sessionsRepo.create({
          deviceToken,
          agent,
          ip,
          refreshToken: token,
          expires,
        });

        return tx.save(session);
      },
    );

    const { token, expires } = await this.jwtService.createAccessToken(
      foundUser,
    );

    console.log('here');

    return {
      accessToken: token,
      expires,
      refreshToken,
    };
  }

  async refresh(
    refreshToken: string,
    { ip }: ISessionMeta,
  ): Promise<ITokenPair> {
    const now = new Date();
    const sess = await this.sessionsRepo.findOne({ refreshToken });

    if (!sess || sess.expires < now) {
      throw new BadRefreshTokenException();
    }

    if (ip) {
      sess.ip = ip;
    }

    const refresh = await this.jwtService.createRefreshToken({
      id: sess.user.id,
    });

    sess.expires = refresh.expires;
    sess.refreshToken = refresh.token;

    await this.sessionsRepo.save(sess);

    const access = await this.jwtService.createAccessToken(sess.user);

    return {
      refreshToken: refresh.token,
      expires: access.expires,
      accessToken: access.token,
    };
  }

  async test() {
    return this.userService.getAll();
  }
}
