import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserService } from './users.service';
import * as faker from 'faker';
import { SessionEntity } from '../auth/entities/session.entity';
import { v4 } from 'uuid';

export const existingUserPassword = faker.internet.password();

describe('UsersService', () => {
  let service: UserService;

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
  };

  const userRepoMock = {
    create: jest.fn().mockImplementation(x => x),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          provide: getRepositoryToken(UserEntity),
          useValue: userRepoMock,
        },
        UserService,
      ],
    }).compile();

    service = await module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user = await service.create(testUser);

    expect(userRepoMock.create).toBeCalledWith(testUser);

    expect(userRepoMock.save).toBeCalled();
  });
});
