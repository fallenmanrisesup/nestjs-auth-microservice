import './Fixtures/env';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'typeorm';
import { AppModule } from './../src/app.module';
import { ValidationExceptionFilter } from '../src/core/filters/validation-exception.filter';
import {
  existingUser,
  existingUserPassword,
  existingUserSessionMeta,
  loadAuthFixtures,
} from './Fixtures/auth';
import { RegisterDto } from '../src/auth/dtos/register.dto';
import { EmailExistsException } from '../src/auth/excepctions/email-exists.exception';
import { LoginDto } from '../src/auth/dtos/login.dto';
import { TestLogger } from './test-logger';
import { IncorrectCredentialsException } from '../src/auth/excepctions/incorrect-credentials.exception';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let conn: Connection;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    app.useLogger(new TestLogger());

    conn = await app.get<Connection>(Connection);
    app.useGlobalFilters(new ValidationExceptionFilter());
    await conn.synchronize();
    await loadAuthFixtures(conn);
    await app.init();
  });

  afterEach(async () => {
    await conn.dropDatabase();
    await conn.close();
  });

  it('/auth/register (POST) 201', async () => {
    const registerBody: RegisterDto = {
      email: 'test1@email.email',
      username: 'test111',
      password: 'test1emailE',
      ip: '111.111.111.111',
      agent: 'IPhone X',
      deviceToken: 'unique-token-111',
    };

    const resp = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerBody);

    expect(resp.status).toBe(201);
  });

  it('/auth/register (POST) 400', async () => {
    const registerBody: RegisterDto = {
      email: existingUser.email,
      username: existingUser.username,
      password: existingUserPassword,
      ip: '111.111.111.111',
      agent: 'IPhone X',
      deviceToken: 'unique-token-111',
    };

    const resp = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerBody);

    expect(resp.status).toBe(400);
    expect(resp.body.message).toBe(new EmailExistsException().message);
  });

  it('/auth/login (POST) 201', async () => {
    const loginBody: LoginDto = {
      emailOrUsername: existingUser.email,
      password: existingUserPassword,
      ...existingUserSessionMeta,
    };

    const resp = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginBody);

    expect(resp.status).toBe(201);

    const { accessToken, refreshToken, expires } = resp.body;

    expect(accessToken).not.toBeNull();
    expect(refreshToken).not.toBeNull();
    expect(expires).not.toBeNull();
  });

  it('/auth/login (POST) 400', async () => {
    const loginBody: LoginDto = {
      emailOrUsername: '21jk;jdsakljdl',
      password: existingUserPassword,
      ip: '111.111.111.111',
      agent: 'IPhone X',
      deviceToken: 'unique-token-111',
    };

    const resp = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginBody);

    expect(resp.status).toBe(400);
    expect(resp.body.message).toBe(new IncorrectCredentialsException().message);
  });
});
