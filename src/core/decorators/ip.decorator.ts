import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequest } from '../extensions';

export const Ip = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest() as IRequest;

  return req.ip;
});
