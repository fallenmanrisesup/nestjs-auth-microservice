import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  OrderByEnum,
  PaginatedResult,
  PaginationArgs,
} from '../../core/dtos/pagination';
import { UserEntity } from '../entities/user.entity';

export enum UserOrderFields {
  EMAIL = 'email',
  USERNAME = 'username',
  LANG = 'lang',
  CREATED = 'created',
}

registerEnumType(UserOrderFields, { name: 'UserOrderFields' });

@InputType()
export class UserOrderByInput {
  @Field(() => UserOrderFields)
  field: UserOrderFields;

  @Field(() => OrderByEnum)
  order: OrderByEnum;
}

@ArgsType()
export class ListUsersArgs extends PaginationArgs {
  @Field(() => UserOrderByInput, { nullable: true })
  orderBy?: UserOrderByInput;
}

@ObjectType()
export class ListUsersResult extends PaginatedResult {
  @Field(() => [UserEntity])
  items: UserEntity[];
}
