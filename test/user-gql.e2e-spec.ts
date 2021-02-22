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
import { getGraphqlClient, GraphqlClientFn } from './Utils/graphql-client';

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

  it('query users (SUCCESS)', async () => {
    const gqlReq = getGraphqlClient(app);
    const body = await gqlReq<any, any>({
      query: `
        query($page: Int!, $perPage: Int!) {
          users(page: $page, perPage: $perPage) {
            items {
              id
              username
            }
            total 
            hasMore
          }
        }
      `,
      variables: {
        page: 0,
        perPage: 100,
      },
    });

    const { data, errors } = body;
    expect(errors).not.toBeDefined();
    expect(data.users).not.toBeNull();
    expect(data.total).not.toBeNull();
    expect(data.hasMore).not.toBeNull();
  });
});
