import { IsNotEmpty } from 'class-validator';

export class RecoverPasswordConfirmDto {
  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  password: string;
}
