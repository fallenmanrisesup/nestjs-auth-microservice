import './Fixtures/env';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'typeorm';
import { AppModule } from './../src/app.module';
import { ValidationExceptionFilter } from '../src/core/filters/validation-exception.filter';
import { existingUser, loadAuthFixtures, loginExistingUser } from './Fixtures';
import { TestLogger } from './test-logger';
import { IncorrectEmailCodeException } from '../src/auth-confirmations/exceptions/incorrect-email-code.exception';

describe('AuthConfirmationsController (e2e)', () => {
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
    await conn.synchronize(true);
    await loadAuthFixtures(conn, { isVerified: false });
    await app.init();
  });

  afterEach(async () => {
    await conn.close();
  });

  it('/auth-confirmations/verify-email (POST) 201', async () => {
    const resp = await request(app.getHttpServer())
      .post('/auth-confirmations/verify-email')
      .send({ code: existingUser.emailVerificationCode });

    expect(resp.status).toBe(201);

    const authResp = await loginExistingUser(request(app.getHttpServer()));

    expect(authResp.status).toBe(201);

    const meResp = await request(app.getHttpServer())
      .get('/auth/me')
      .set({ Authorization: `Bearer ${authResp.body.accessToken}` });

    expect(meResp.status).toBe(200);
    expect(meResp.body.isVerified).toBeTruthy();
  });

  it('/auth-confirmations/verify-email (POST) 400', async () => {
    const code = 'bad code lul';

    const resp = await request(app.getHttpServer())
      .post('/auth-confirmations/verify-email')
      .send({ code });
    expect(resp.status).toBe(400);
    expect(resp.body.message).toBe(new IncorrectEmailCodeException().message);
  });
});
