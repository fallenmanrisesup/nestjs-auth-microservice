import { Length } from 'class-validator';

export class ResetPasswordDto {
  @Length(8, 16)
  password: string;
}
