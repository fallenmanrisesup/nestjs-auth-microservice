import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IGraphqlContext, IRequest } from '../extensions';

export const Claims = createParamDecorator(
  (contextType: 'http' | 'graphql', ctx: ExecutionContext) => {
    if (contextType === 'http') {
      const req = ctx.switchToHttp().getRequest() as IRequest;

      return req.user;
    }

    if (contextType === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(ctx);
      const { user } = gqlCtx.getContext() as IGraphqlContext;
      return user;
    }
  },
);
