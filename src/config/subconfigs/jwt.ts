import { registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

export interface IJwtConfigProps {
  secret: string;
  accessExpires: string;
  refreshExpires: string;
}

export default registerAs<ConfigFactory<IJwtConfigProps>>('jwt', () => ({
  secret: process.env.JWT_SECRET,
  accessExpires: process.env.JWT_EXPIRES,
  refreshExpires: process.env.REFRESH_EXPIRES,
}));
