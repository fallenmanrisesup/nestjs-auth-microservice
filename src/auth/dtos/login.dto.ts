import { ISessionMeta } from '../intrafeces/login-meta';

export class LoginDto implements ISessionMeta {
  emailOrUsername: string;

  password: string;

  ip: string;

  agent: string;

  deviceToken: string;
}
