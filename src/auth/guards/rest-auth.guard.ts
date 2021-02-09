import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { IRequest } from '../../core/extensions';

@Injectable()
export class RestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest() as IRequest;

    return !!req.user;
  }
}
