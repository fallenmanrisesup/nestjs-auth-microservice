import {
  ArgsType,
  Field,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

export enum OrderByEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(OrderByEnum, { name: 'OrderByEnum' });

@ArgsType()
export class PaginationArgs {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  perPage: number;
}

@ObjectType({ isAbstract: true })
export class PaginatedResult {
  @Field(() => Int)
  total: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
