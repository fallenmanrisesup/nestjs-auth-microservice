import { Connection } from 'typeorm';
import { v4 } from 'uuid';
import { UserEntity } from '../../src/users/entities/user.entity';
import { SessionEntity } from '../../src/auth/entities/session.entity';
import { EncryptionService } from '../../src/encryption/encryption.service';

export const existingUserPassword = 'testpassword123';

export const existingUser: UserEntity = {
  id: v4(),
  username: 'testing',
  email: 'testing@testing.com',
  password: '',
  lang: 'en',
  isVerified: true,
  sessions: new Array<SessionEntity>(),
  created: new Date(),
  updated: new Date(),
  resetPasswordCode: 'test',
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
