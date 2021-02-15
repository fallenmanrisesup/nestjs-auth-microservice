import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ defaultValue: 'en' })
  lang?: string;
}
