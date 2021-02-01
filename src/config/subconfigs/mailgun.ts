import { registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

export interface IMailgunConfigProps {
  apiKey: string;
  domain: string;
  host: string;
  from: string;
}

export default registerAs<ConfigFactory<IMailgunConfigProps>>(
  'mailgun',
  () => ({
    apiKey: process.env.MAILGUN_API_KEY || 'some-key',
    domain: process.env.MAILGUN_DOMAIN || 'domain',
    host: process.env.MAILGUN_HOST || 'host',
    from: process.env.MAILGUN_FROM || 'from@email.com',
  }),
);
