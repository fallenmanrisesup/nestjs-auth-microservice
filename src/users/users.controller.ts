import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserServiceEvents } from '../core/events';
import { UserService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(UserServiceEvents.FIND_USER_RPC)
  async findUserRpc(id: string) {
    return this.userService.find({ where: { id } });
  }
}
