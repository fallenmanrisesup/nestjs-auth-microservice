import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { JwtService } from '../jwt/jwt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from './entities/session.entity';
import { RegisterDto } from './dtos/register.dto';
import { EmailExistsException } from './excepctions/email-exists.exception';
import { ITokenPair } from './intrafeces/token-pair';
import { LoginDto } from './dtos/login.dto';
import { ISessionMeta } from './intrafeces/session-meta';
import { IncorrectCredentialsException } from './excepctions/incorrect-credentials.exception';
import { BadRefreshTokenException } from './excepctions/bad-refresh-token.exception';
import { EncryptionService } from '../encryption/encryption.service';
import { LogoutDto } from './dtos/logout.dto';
import { IJwtClaims } from '../jwt/interfaces/jwt-claims';
import { AuthConfirmationsService } from '../auth-confirmations/auth-confirmations.service';
import { RecoverPasswordDto } from './dtos/recover-password.dto';
import { RecoverPasswordConfirmDto } from './dtos/recover-password-confirm.dto';
import { IncorrectRecoveryCodeException } from './excepctions/incorrect-code.exception';
import { LoginTokenDto } from './dtos/login-token.dto';
import { SmsTokenEntity } from './entities/sms-token.entity';
import { NoSmsTokenException } from './excepctions/no-sms-token.exception';
import { UserEntity } from 'src/users/entities/user.entity';
import { CreateSmsTokenDto } from './dtos/create-sms-token.dto';
import { SMS_TOKEN_EXP } from './auth.consts';
import { PhoneInUseException } from './excepctions/phone-in-use.exception';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(SessionEntity)
    private readonly sessionsRepo: Repository<SessionEntity>,
    @InjectRepository(SmsTokenEntity)
    private readonly smsTokensRepo: Repository<SmsTokenEntity>,
    private readonly authConfirmationService: AuthConfirmationsService,
  ) {}

  async register({ email, username, password, phone }: RegisterDto) {
    const found = await this.userService.find({
      where: [{ email }, { username }],
    });

    if (found) {
      throw new EmailExistsException();
    }

    if (phone && (await this.userService.find({ where: { phone } }))) {
      //
      throw new PhoneInUseException();
    }

    const pwd = await this.encryptionService.hash(password);

    const user = await this.userService.create({
      email,
      username,
      password: pwd,
      phone,
    });

    await this.authConfirmationService.sendEmailConfirmation(
      user,
      this.authConfirmationService.createCode(),
    );

    return user;
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

    if (
      !foundUser ||
      !(await this.encryptionService.compare(password, foundUser.password))
    ) {
      throw new IncorrectCredentialsException();
    }

    return await this.signTokens(foundUser, { deviceToken, ip, agent });
  }

  async refresh(
    refreshToken: string,
    { ip }: ISessionMeta,
  ): Promise<ITokenPair> {
    const now = new Date();
    const sess = await this.sessionsRepo.findOne({
      where: { refreshToken },
      relations: ['user'],
    });

    this.logger.log(refreshToken);

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

    this.logger.log(refresh.token);

    await this.sessionsRepo.update(sess.id, {
      refreshToken: refresh.token,
      expires: refresh.expires,
      ip: sess.ip,
    });

    const access = await this.jwtService.createAccessToken(sess.user);

    return {
      refreshToken: refresh.token,
      expires: access.expires,
      accessToken: access.token,
    };
  }

  async logout({ userId, deviceToken }: LogoutDto) {
    await this.sessionsRepo.delete({ user: { id: userId }, deviceToken });
  }

  getUserFromClaims({ id }: IJwtClaims) {
    return this.userService.find({ where: { id } });
  }

  async recoverPassword(body: RecoverPasswordDto) {
    await this.authConfirmationService.createPasswordRecovery(body);
  }

  async recoverPasswordConfirm(body: RecoverPasswordConfirmDto) {
    const password = await this.encryptionService.hash(body.password);

    const userFound = await this.userService.find({
      where: { resetPasswordCode: body.code },
    });

    if (!userFound) {
      throw new IncorrectRecoveryCodeException();
    }

    await this.userService.updateUser(
      { id: userFound.id },
      { password, resetPasswordCode: null },
    );
  }

  async signTokens(user: UserEntity, { agent, deviceToken, ip }: ISessionMeta) {
    const { refreshToken } = await this.sessionsRepo.manager.transaction(
      async tx => {
        const prevSessions = await this.sessionsRepo.find({
          where: { agent, deviceToken },
        });

        await tx.remove<SessionEntity>(prevSessions);

        const { token, expires } = await this.jwtService.createRefreshToken({
          id: user.id,
        });

        const session = this.sessionsRepo.create({
          deviceToken,
          agent,
          ip,
          refreshToken: token,
          expires,
          user,
        });

        return tx.save(session);
      },
    );

    const { token, expires } = await this.jwtService.createAccessToken(user);

    return {
      refreshToken,
      expires,
      accessToken: token,
    };
  }

  async createSmsToken({ phone }: CreateSmsTokenDto) {
    const foundUser = await this.userService.find({ where: { phone } });

    const token = await this.authConfirmationService.createCode(3);

    await this.smsTokensRepo.create({
      token,
      expires: new Date(new Date().getTime() + SMS_TOKEN_EXP),
      user: foundUser,
    });

    await this.authConfirmationService.sendSmsCode(phone, token);
  }

  async loginWithSmsToken({ token, agent, deviceToken, ip }: LoginTokenDto) {
    const foundToken = await this.smsTokensRepo.findOne({ where: { token } });

    if (!foundToken) {
      throw new NoSmsTokenException();
    }

    if (foundToken.user) {
      return await this.signTokens(foundToken.user, { deviceToken, ip, agent });
    }

    const foundNumber = await this.userService.find({
      where: { phone: foundToken.phone },
    });

    if (foundNumber) {
      throw new EmailExistsException();
    }

    const user = await this.userService.create({
      phone: foundToken.phone,
    });

    return await this.signTokens(user, { deviceToken, ip, agent });
  }

  async resetPassword(jwtClaims: IJwtClaims, body: ResetPasswordDto) {
    const password = await this.encryptionService.hash(body.password);

    await this.userService.updateUser({ id: jwtClaims.id }, { password });
  }
}
