import { Args, Resolver, Query, Mutation } from '@nestjs/graphql';
import { ListUsersArgs, ListUsersResult } from './dtos/users-pagination';
import { UserEntity } from './entities/user.entity';
import { UserService } from './users.service';
import { CreateUserInput } from './dtos/create-user.dto';
import { EncryptionService } from '../encryption/encryption.service';

@Resolver(() => UserEntity)
export class UserResolver {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly userService: UserService,
  ) {}

  @Query(() => ListUsersResult)
  users(@Args() args: ListUsersArgs) {
    return this.userService.list(args);
  }

  @Mutation(() => UserEntity)
  async createUser(@Args('input') input: CreateUserInput) {
    const password = await this.encryptionService.hash(input.password);

    return this.userService.create({ ...input, password });
  }
}
