import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserService } from './users.service';
import * as faker from 'faker';
import { SessionEntity } from '../auth/entities/session.entity';
import { v4 } from 'uuid';
import { UserNotFoundException } from './exceptions/not-found.exception';
import { UserRoles } from './enums/user.roles';

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
    role: UserRoles.RESPONDENT,
    isRespondent: false,
  };

  const userRepoMock = {
    create: jest.fn().mockImplementation(x => x),
    save: jest.fn().mockImplementation(x => x),
    remove: jest.fn(),
    findOne: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const user = await service.create(testUser);

    expect(userRepoMock.create).toBeCalledWith(testUser);

    expect(userRepoMock.save).toBeCalled();

    const userRepoCreate = jest.spyOn(userRepoMock, 'create');

    expect(userRepoMock.save).toBeCalledWith(
      userRepoCreate.mock.results[0].value,
    );

    expect(user).toBeDefined();
    expect(user).not.toBeNull();
  });

  it('should throw error if no user found', async () => {
    userRepoMock.findOne.mockResolvedValueOnce(null);

    expect(() => service.delete(testUser.id)).rejects.toThrow(
      UserNotFoundException,
    );

    expect(userRepoMock.findOne).toBeCalledWith(testUser.id);
  });

  it('should delete user if found', async () => {
    userRepoMock.findOne.mockResolvedValue(testUser);

    await service.delete(testUser.id);

    expect(userRepoMock.findOne).toBeCalledWith(testUser.id);
    expect(userRepoMock.findOne).toBeCalledWith(testUser.id);

    expect(userRepoMock.remove).toBeCalledWith(testUser);
  });

  it('should return find user result', async () => {
    userRepoMock.findOne.mockResolvedValue(testUser);

    const result = await service.find({ where: testUser });
    const findOneResult = await userRepoMock.findOne.mock.results[0].value;

    expect(result).toBe(findOneResult);
  });

  it('should return find user by email or name result', async () => {
    userRepoMock.findOne.mockResolvedValue(testUser);

    const result = await service.findByEmailOrUsername(testUser.email);
    const findOneResult = await userRepoMock.findOne.mock.results[0].value;

    expect(result).toBe(findOneResult);
  });
});
