import { ISessionMeta } from '../intrafeces/session-meta';
export class LogoutDto implements ISessionMeta {
  userId: string;

  agent: string;

  deviceToken: string;
}
