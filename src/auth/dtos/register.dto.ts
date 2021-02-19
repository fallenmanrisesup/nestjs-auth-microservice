import {
  IsEmail,
  IsEmpty,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { ISessionMeta } from '../intrafeces/session-meta';

export class RegisterDto implements ISessionMeta {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(3, 16)
  username: string;

  @Length(8, 16)
  password: string;

  @ValidateIf(x => x.phone !== '' && typeof x.phone !== 'undefined')
  @IsString()
  @IsPhoneNumber()
  phone?: string;

  ip?: string;

  agent: string;

  deviceToken: string;
}
