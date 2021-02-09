import { Request } from 'express';
import { IJwtClaims } from '../jwt/interfaces/jwt-claims';

export interface IRequest extends Request {
  user?: IJwtClaims;
}

export interface IGraphqlContext {
  user?: IJwtClaims;
}
