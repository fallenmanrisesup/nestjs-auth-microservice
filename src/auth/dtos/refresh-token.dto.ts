import { ISessionMeta } from '../intrafeces/session-meta';

export class RefreshTokenDto implements ISessionMeta {
  refreshToken: string;

  ip?: string;

  agent: string;

  deviceToken: string;
}
