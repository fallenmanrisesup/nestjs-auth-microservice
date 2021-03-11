import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { AuthConfirmationsService } from '../auth-confirmations/auth-confirmations.service';
import { EncryptionService } from '../encryption/encryption.service';
import { JwtService } from '../jwt/jwt.service';
import { UserService } from '../users/users.service';
import { AuthService } from './auth.service';
import { SessionEntity } from './entities/session.entity';
import { SmsTokenEntity } from './entities/sms-token.entity';
import { v4 } from 'uuid';
import * as faker from 'faker';
import { EmailExistsException } from './excepctions/email-exists.exception';
import { PhoneInUseException } from './excepctions/phone-in-use.exception';
import { IncorrectCredentialsException } from './excepctions/incorrect-credentials.exception';
import { BadRefreshTokenException } from './excepctions/bad-refresh-token.exception';
import { UserRoles } from '../users/enums/user.roles';

describe('AuthService', () => {
  let service: AuthService;

  const testUser: UserEntity = {
    id: v4(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: '',
    phone: faker.phone.phoneNumber(),
    lang: 'en',
    isVerified: true,
    sessions: new Array<SessionEntity>(),
    created: new Date(),
    updated: new Date(),
    resetPasswordCode: 'constcode',
    emailVerificationCode: 'constcode',
    role: UserRoles.SITE_OWNER,
    isRespondent: false,
  };

  const testUserSessionMeta = {
    ip: faker.internet.ip(),
    agent: faker.internet.userAgent(),
    deviceToken: v4(),
  };

  const encryptionServiceMock = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const userServiceMock = {
    find: jest.fn(),
    create: jest.fn(),
    findByEmailOrUsername: jest.fn(),
    updateUser: jest.fn(),
  };

  const jwtServiceMock = {
    createRefreshToken: jest.fn(),
    createAccessToken: jest.fn(),
  };

  const sessionsRepoMock = {
    findOne: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };

  const smsTokensRepoMock = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const authConfirmationServiceMock = {
    createCode: jest.fn(),
    sendEmailConfirmation: jest.fn(),
    sendSmsCode: jest.fn(),
    createPasswordRecovery: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        AuthService,
        {
          provide: EncryptionService,
          useValue: encryptionServiceMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: getRepositoryToken(SmsTokenEntity),
          useValue: smsTokensRepoMock,
        },
        {
          provide: getRepositoryToken(SessionEntity),
          useValue: sessionsRepoMock,
        },
        {
          provide: AuthConfirmationsService,
          useValue: authConfirmationServiceMock,
        },
      ],
    }).compile();

    service = await module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should register user successfuly', async () => {
    const { email, password, username } = testUser;
    const code = v4();

    userServiceMock.find.mockResolvedValueOnce(testUser);
    userServiceMock.create.mockResolvedValueOnce(testUser);
    authConfirmationServiceMock.createCode.mockReturnValueOnce(code);
    encryptionServiceMock.hash.mockResolvedValueOnce(password + password);

    expect(() =>
      service.register({
        email,
        password,
        username,
        ...testUserSessionMeta,
      }),
    ).not.toThrow();
  });

  it('should register user successfuly', async () => {
    const { email, password, username } = testUser;
    const code = v4();

    userServiceMock.find.mockResolvedValueOnce(null);
    userServiceMock.create.mockResolvedValueOnce(testUser);
    authConfirmationServiceMock.createCode.mockReturnValueOnce(code);
    encryptionServiceMock.hash.mockResolvedValueOnce(password + password);

    expect(() =>
      service.register({
        email,
        password,
        username,
        ...testUserSessionMeta,
      }),
    ).not.toThrow();
  });

  it('should not register user because of email duplicate', async () => {
    const { email, password, username } = testUser;
    const code = v4();

    userServiceMock.find.mockResolvedValue(testUser);
    userServiceMock.create.mockResolvedValueOnce(testUser);
    authConfirmationServiceMock.createCode.mockReturnValueOnce(code);
    encryptionServiceMock.hash.mockResolvedValueOnce(password + password);

    expect(() =>
      service.register({
        email,
        password,
        username,
        ...testUserSessionMeta,
      }),
    ).rejects.toThrow(EmailExistsException);
  });

  it('should not register user because of phone duplicate', async () => {
    const { email, password, username, phone } = testUser;
    const code = v4();

    userServiceMock.find.mockResolvedValueOnce(null);
    userServiceMock.find.mockResolvedValueOnce(testUser);
    userServiceMock.create.mockResolvedValueOnce(testUser);
    authConfirmationServiceMock.createCode.mockReturnValueOnce(code);
    encryptionServiceMock.hash.mockResolvedValueOnce(password + password);

    expect(
      async () =>
        await service.register({
          email,
          password,
          username,
          ...testUserSessionMeta,
          phone,
        }),
    ).rejects.toThrow(PhoneInUseException);
  });

  it('should login when user found and password is correct', async () => {
    const spy = jest.spyOn(service, 'signTokens');

    const tokens = {
      accessToken: v4(),
      refreshToken: v4(),
      expires: new Date(),
    };

    spy.mockResolvedValue(tokens);

    encryptionServiceMock.compare.mockResolvedValue(true);

    userServiceMock.findByEmailOrUsername.mockResolvedValue(testUser);

    const result = await service.login({
      emailOrUsername: testUser.email,
      password: testUser.password,
      ...testUserSessionMeta,
    });

    expect(result).toBeDefined();
    expect(result).toBe(tokens);
  });

  it('should not login when user not found', async () => {
    encryptionServiceMock.compare.mockResolvedValue(true);

    userServiceMock.findByEmailOrUsername.mockResolvedValue(null);

    expect(() =>
      service.login({
        emailOrUsername: testUser.email,
        password: testUser.password,
        ...testUserSessionMeta,
      }),
    ).rejects.toThrow(IncorrectCredentialsException);
  });

  it('should not login when password is incorrect', async () => {
    encryptionServiceMock.compare.mockResolvedValue(true);

    userServiceMock.findByEmailOrUsername.mockResolvedValue(testUser);

    encryptionServiceMock.compare.mockResolvedValue(false);

    expect(() =>
      service.login({
        emailOrUsername: testUser.email,
        password: testUser.password,
        ...testUserSessionMeta,
      }),
    ).rejects.toThrow(IncorrectCredentialsException);
  });

  it('should successfuly refresh tokens', async () => {
    const refreshToken = v4();

    const expires = new Date();
    expires.setMonth(expires.getMonth() + 3);

    sessionsRepoMock.findOne.mockResolvedValue({
      refreshToken,
      deviceToken: v4(),
      ...testUserSessionMeta,
      expires,
      user: testUser,
    });

    jwtServiceMock.createRefreshToken.mockResolvedValueOnce({
      token: v4(),
      expires,
    });

    jwtServiceMock.createAccessToken.mockResolvedValueOnce({
      token: v4(),
      expires,
    });

    const result = await service.refresh(refreshToken, testUserSessionMeta);

    expect(result).toBeDefined();
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.expires).toBeDefined();
  });

  it('should not refresh tokens because it was not found', async () => {
    const refreshToken = v4();

    sessionsRepoMock.findOne.mockResolvedValue(null);

    expect(() =>
      service.refresh(refreshToken, testUserSessionMeta),
    ).rejects.toThrow(BadRefreshTokenException);
  });

  it('should not refresh tokens because it was expired', async () => {
    const refreshToken = v4();

    const expires = new Date();
    expires.setMonth(expires.getMonth() - 3);

    sessionsRepoMock.findOne.mockResolvedValue({
      refreshToken,
      deviceToken: v4(),
      ...testUserSessionMeta,
      expires,
      user: testUser,
    });

    expect(() =>
      service.refresh(refreshToken, testUserSessionMeta),
    ).rejects.toThrow(BadRefreshTokenException);
  });

  //   async loginWithSmsToken({ token, agent, deviceToken, ip }: LoginTokenDto) {
  //     const foundToken = await this.smsTokensRepo.findOne({ where: { token } });

  //     if (!foundToken) {
  //       throw new NoSmsTokenException();
  //     }

  //     if (foundToken.user) {
  //       return await this.signTokens(foundToken.user, { deviceToken, ip, agent });
  //     }

  //     const foundNumber = await this.userService.find({
  //       where: { phone: foundToken.phone },
  //     });

  //     if (foundNumber) {
  //       throw new EmailExistsException();
  //     }

  //     const user = await this.userService.create({
  //       phone: foundToken.phone,
  //     });

  //     return await this.signTokens(user, { deviceToken, ip, agent });
  //   }
});
