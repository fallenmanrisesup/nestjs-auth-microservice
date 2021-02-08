export interface ITokenClaims {
  id: string;
}

export interface IJwtClaims extends ITokenClaims {
  email: string;
  username: string;
  lang: string;
}
