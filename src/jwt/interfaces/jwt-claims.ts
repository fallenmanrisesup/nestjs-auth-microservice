import { UserRoles } from '../../users/enums/user.roles';

export interface ITokenClaims {
  id: string;
}

export interface IJwtClaims extends ITokenClaims {
  email?: string;
  phone?: string;
  username?: string;
  isVerified: boolean;
  lang: string;
  role: UserRoles;
  isRespondent: boolean;
}
