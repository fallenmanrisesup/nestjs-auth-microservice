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
  loginExistingUser,
} from './Fixtures';
import { RegisterDto } from '../src/auth/dtos/register.dto';
import { EmailExistsException } from '../src/auth/excepctions/email-exists.exception';
import { LoginDto } from '../src/auth/dtos/login.dto';
import { TestLogger } from './test-logger';
import { IncorrectCredentialsException } from '../src/auth/excepctions/incorrect-credentials.exception';
import { BadRefreshTokenException } from '../src/auth/excepctions/bad-refresh-token.exception';
import { v4 } from 'uuid';
import { IncorrectRecoveryCodeException } from '../src/auth/excepctions/incorrect-code.exception';

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

  it('/auth/login (POST) 400', async () => {
    const loginBody: LoginDto = {
      emailOrUsername: existingUser.email,
      password: '21u3iuhjskoalh',
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

  it('/auth/me (GET) 200', async () => {
    const authResp = await loginExistingUser(request(app.getHttpServer()));

    expect(authResp.status).toBe(201);

    const { accessToken } = authResp.body;

    const resp = await request(app.getHttpServer())
      .get('/auth/me')
      .set({ Authorization: `Bearer ${accessToken}` });

    expect(resp.status).toBe(200);
    expect(resp.body.username).toBe(existingUser.username);
  });

  it('/auth/me (GET) 403', async () => {
    const resp = await request(app.getHttpServer()).get('/auth/me');

    expect(resp.status).toBe(403);
  });

  it('/auth/logout (DELETE) 204', async () => {
    const authResp = await loginExistingUser(request(app.getHttpServer()));

    expect(authResp.status).toBe(201);

    const { accessToken } = authResp.body;

    const resp = await request(app.getHttpServer())
      .delete('/auth/logout')
      .set({ Authorization: `Bearer ${accessToken}` });

    expect(resp.status).toBe(204);
  });

  it('/auth/logout (DELETE) 204', async () => {
    const resp = await request(app.getHttpServer()).delete('/auth/logout');

    expect(resp.status).toBe(403);
  });

  it('/auth/refresh (PATCH) 200', async () => {
    const authResp = await loginExistingUser(request(app.getHttpServer()));

    expect(authResp.status).toBe(201);

    const { refreshToken } = authResp.body;

    const resp = await request(app.getHttpServer())
      .patch('/auth/refresh')
      .send({ refreshToken, ...existingUserSessionMeta });

    expect(resp.status).toBe(200);
  });

  it('/auth/refresh (PATCH) 400', async () => {
    const authResp = await loginExistingUser(request(app.getHttpServer()));

    expect(authResp.status).toBe(201);

    const { refreshToken } = authResp.body;

    await request(app.getHttpServer())
      .patch('/auth/refresh')
      .send({ refreshToken, ...existingUserSessionMeta });

    const resp = await request(app.getHttpServer())
      .patch('/auth/refresh')
      .send({ refreshToken, ...existingUserSessionMeta });
    expect(resp.status).toBe(400);
    expect(resp.body.message).toBe(new BadRefreshTokenException().message);
  });

  it('/auth/refresh PATH(400)', async () => {
    const resp = await request(app.getHttpServer())
      .patch('/auth/refresh')
      .send({ refreshToken: 'ivalidrefresh', ...existingUserSessionMeta });
    expect(resp.status).toBe(400);
    expect(resp.body.message).toBe(new BadRefreshTokenException().message);
  });

  it('/auth/password-reset POST(201)', async () => {
    const authResp = await loginExistingUser(request(app.getHttpServer()));

    expect(authResp.status).toBe(201);

    const { accessToken } = authResp.body;

    const resetPassword = v4();

    const resp = await request(app.getHttpServer())
      .post('/auth/password-reset')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({ password: resetPassword });

    expect(resp.status).toBe(201);

    const newPasswordAuthResp = await loginExistingUser(
      request(app.getHttpServer()),
      {
        password: resetPassword,
      },
    );

    expect(newPasswordAuthResp.status).toBe(201);
  });

  it('/auth/password-reset POST(403)', async () => {
    const resetPassword = v4();
    const resp = await request(app.getHttpServer())
      .post('/auth/password-reset')
      .send({ password: resetPassword });

    expect(resp.status).toBe(403);
  });

  it('/auth/password-recovery POST(201)', async () => {
    const resp = await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({ email: existingUser.email });

    expect(resp.status).toBe(201);
  });

  it('/auth/password-recovery POST(201)', async () => {
    const resp = await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({ email: 'not-found-email@mail.com' });

    expect(resp.status).toBe(400);
    expect(resp.body.message).toBe(new IncorrectCredentialsException().message);
  });

  it('/auth/password-recovery/confirm POST(201)', async () => {
    const recoveryPassword = v4();
    const resp = await request(app.getHttpServer())
      .post('/auth/password-recovery/confirm')
      .send({
        code: existingUser.resetPasswordCode,
        password: recoveryPassword,
      });

    expect(resp.status).toBe(201);

    const authResp = await loginExistingUser(request(app.getHttpServer()), {
      password: recoveryPassword,
    });

    expect(authResp.status).toBe(201);
  });

  it('/auth/password-recovery/confirm POST(400)', async () => {
    const recoveryPassword = v4();
    const resp = await request(app.getHttpServer())
      .post('/auth/password-recovery/confirm')
      .send({
        code: 'not code',
        password: recoveryPassword,
      });

    expect(resp.status).toBe(400);
    expect(resp.body.message).toBe(
      new IncorrectRecoveryCodeException().message,
    );
  });
});
