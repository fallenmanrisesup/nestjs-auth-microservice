import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', async () => {
    const resp = await request(app.getHttpServer()).get('/');

    expect(resp.status).toBe(200);
    const { name, pid, mode, version } = resp.body;
    expect(name).not.toBeNull();
    expect(pid).not.toBeNull();
    expect(mode).not.toBeNull();
    expect(version).not.toBeNull();
  });
});
