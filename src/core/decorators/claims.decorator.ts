import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequest } from '../extensions';

export const Claims = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest() as IRequest;

  return req.user;
});
