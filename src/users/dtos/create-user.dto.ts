import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserDto {
  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  password: string;

  @Field({ defaultValue: 'en' })
  lang?: string;
}
