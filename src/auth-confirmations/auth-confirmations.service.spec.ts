import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthConfirmationsService } from './auth-confirmations.service';
import { NOTIFICATIONS_SERVICE_TOKEN } from './providers/notification-service.provider';
import { UserEntity } from '../users/entities/user.entity';
import { UserService } from '../users/users.service';
import * as faker from 'faker';
import { SessionEntity } from '../auth/entities/session.entity';
import { v4 } from 'uuid';
import { IncorrectCredentialsException } from '../auth/excepctions/incorrect-credentials.exception';
import { IncorrectEmailCodeException } from './exceptions/incorrect-email-code.exception';
import { UserRoles } from '../users/enums/user.roles';

describe('AuthConfirmationsService', () => {
  let service: AuthConfirmationsService;

  const notificationServiceClientMock = {
    emit: jest.fn(),
  };

  const userServiceMock = {
    find: jest.fn(),
    updateUser: jest.fn().mockResolvedValue(null),
  };

  const testUser: UserEntity = {
    id: v4(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: '',
    lang: 'en',
    isVerified: true,
    sessions: new Array<SessionEntity>(),
    created: new Date(),
    updated: new Date(),
    resetPasswordCode: 'constcode',
    emailVerificationCode: 'constcode',
    isRespondent: false,
    role: UserRoles.SITE_OWNER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        AuthConfirmationsService,
        {
          provide: NOTIFICATIONS_SERVICE_TOKEN,
          useValue: notificationServiceClientMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    service = await module.get<AuthConfirmationsService>(
      AuthConfirmationsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should createPasswordRecovery code', async () => {
    const createCodeSpy = jest.spyOn(service, 'createCode');
    const randCode = v4();
    createCodeSpy.mockReturnValue(randCode);

    const sendPasswordRecoverySpy = jest.spyOn(service, 'sendPasswordRecovery');

    sendPasswordRecoverySpy.mockImplementation(async (_, __) => {
      //
    });

    userServiceMock.find.mockImplementationOnce(() =>
      Promise.resolve(testUser),
    );

    expect(() => service.createPasswordRecovery(testUser)).not.toThrowError();
  });

  it('should not createPasswordRecovery code and throw', async () => {
    const createCodeSpy = jest.spyOn(service, 'createCode');
    const randCode = v4();
    createCodeSpy.mockReturnValue(randCode);

    userServiceMock.find.mockResolvedValue(null);

    expect(() => service.createPasswordRecovery(testUser)).rejects.toThrow(
      IncorrectCredentialsException,
    );
  });

  it('should verify email', async () => {
    userServiceMock.find.mockResolvedValueOnce(testUser);

    const code = v4();
    const fn = () => service.verifyEmail({ code });
    expect(fn).not.toThrow();
  });

  it('should not verify email and throw', async () => {
    userServiceMock.find.mockResolvedValueOnce(null);
    const code = v4();
    const fn = () => service.verifyEmail({ code });
    expect(fn).rejects.toThrow(IncorrectEmailCodeException);
  });
});
