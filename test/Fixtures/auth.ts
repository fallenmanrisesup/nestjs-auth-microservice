import { Connection } from 'typeorm';
import { v4 } from 'uuid';
import * as request from 'supertest';
import * as faker from 'faker';
import { UserEntity } from '../../src/users/entities/user.entity';
import { SessionEntity } from '../../src/auth/entities/session.entity';
import { EncryptionService } from '../../src/encryption/encryption.service';

export const existingUserPassword = faker.internet.password();

export const existingUser: UserEntity = {
  id: v4(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: '',
  lang: 'en',
  isVerified: true,
  sessions: new Array<SessionEntity>(),
  created: new Date(),
  updated: new Date(),
  resetPasswordCode: v4(),
};

export const existingUserSessionMeta = {
  ip: '111.111.111.123',
  agent: 'IPhone XS',
  deviceToken: 'unique-token-123',
};

export const loadAuthFixtures = async (conn: Connection) => {
  const encryption = new EncryptionService();

  existingUser.password = await encryption.hash(existingUserPassword);
  await conn.getRepository(UserEntity).save(existingUser);
};

export const loginExistingUser = async (
  req: request.SuperTest<request.Test>,
  replacements: Partial<UserEntity> = {},
) => {
  const loginBody = {
    emailOrUsername: existingUser.email,
    password: existingUserPassword,
    ...existingUserSessionMeta,
    ...replacements,
  };

  const resp = await req.post('/auth/login').send(loginBody);
  return resp;
};
