import { registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

export interface IPostgresConfigProps {
  database: string;
  username: string;
  password: string;
  host: string;
  port: number;
  ssl?: boolean;
}

export default registerAs<ConfigFactory<IPostgresConfigProps>>(
  'postgres',
  () => ({
    database: process.env.POSTGRES_DB_NAME,
    username: process.env.POSTGRES_DB_USERNAME,
    password: process.env.POSTGRES_DB_PASSWORD,
    host: process.env.POSTGRES_DB_HOST,
    port: Number(process.env.POSTGRES_DB_PORT),
    ssl: false,
  }),
);
