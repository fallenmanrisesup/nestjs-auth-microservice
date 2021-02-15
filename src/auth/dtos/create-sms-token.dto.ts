import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreateSmsTokenDto {
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  phone: string;
}
