import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export type GraphqlReqPayload<T> = {
  query: string;
  variables?: T;
  operationName?: null;
};

export type GraphqlClientFn = <T, R>(
  payload: GraphqlReqPayload<T>,
  accessToken?: string,
) => Promise<R>;

export type GetGraphqlClient = (app: INestApplication) => GraphqlClientFn;

export const getGraphqlClient: GetGraphqlClient = app => {
  const req = request(app.getHttpServer());

  return async <T = any, R = any>(
    payload: GraphqlReqPayload<T>,
    accessToken,
  ) => {
    const Authorization = accessToken ? `Bearer ${accessToken}` : '';

    const { body } = await req
      .post('/graphql')
      .send(payload)
      .set({ Authorization });

    return body;
  };
};
