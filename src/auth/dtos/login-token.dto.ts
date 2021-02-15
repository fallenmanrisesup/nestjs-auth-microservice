import { IsNotEmpty, IsString } from 'class-validator';
import { ISessionMeta } from '../intrafeces/session-meta';

export class LoginTokenDto implements ISessionMeta {
  @IsNotEmpty()
  @IsString()
  token: string;

  ip?: string;

  agent: string;

  deviceToken: string;
}
