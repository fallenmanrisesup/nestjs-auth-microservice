import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '../users/entities/user.entity';
import * as faker from 'faker';
import { JwtService } from './jwt.service';
import { v4 } from 'uuid';
import { SessionEntity } from '../auth/entities/session.entity';
import { InvalidJwtException } from './excpetions/invalid-jwt.exception';
import { UserRoles } from '../users/enums/user.roles';

export const existingUserPassword = faker.internet.password();

describe('JwtService', () => {
  let service: JwtService;

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
    role: UserRoles.SITE_OWNER,
    isRespondent: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              secret: 'secret key lol',
              accessExpires: 600000,
              refreshExpires: 6000,
            }),
          },
        },
      ],
    }).compile();

    service = await module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should encode and verify access token', async () => {
    const result = await service.createAccessToken(testUser);
    expect(result).not.toBeNull();
    expect(result.token).not.toBeNull();
    expect(result.expires).not.toBeNull();

    expect(() => service.verifyAccessToken(result.token)).not.toThrow();
    const { id } = await service.verifyAccessToken(result.token);

    expect(id).toBe(testUser.id);
  });

  it('should not decode access token and throw', async () => {
    expect(() => service.verifyAccessToken('fake token')).rejects.toThrow(
      InvalidJwtException,
    );
  });

  it('should encode and verify refresh token', async () => {
    const result = await service.createRefreshToken(testUser);
    expect(result).not.toBeNull();
    expect(result.token).not.toBeNull();
    expect(result.expires).not.toBeNull();

    expect(() => service.verifyAccessToken(result.token)).not.toThrow();
    const { id } = await service.verifyAccessToken(result.token);

    expect(id).toBe(testUser.id);
  });

  it('should not decode and throw', async () => {
    expect(() => service.verifyRefreshToken('fake token')).rejects.toThrow(
      InvalidJwtException,
    );
  });
});
