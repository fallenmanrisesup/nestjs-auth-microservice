import { ISessionMeta } from '../intrafeces/login-meta';

export class RegisterDto implements ISessionMeta {
  email: string;

  username: string;

  password: string;

  ip: string;

  agent: string;

  deviceToken: string;
}
