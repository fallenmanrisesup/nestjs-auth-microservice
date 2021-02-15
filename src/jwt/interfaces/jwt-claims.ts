export interface ITokenClaims {
  id: string;
}

export interface IJwtClaims extends ITokenClaims {
  email?: string;
  phone?: string;
  username?: string;
  lang: string;
}
