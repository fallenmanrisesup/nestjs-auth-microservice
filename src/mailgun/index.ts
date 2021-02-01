import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Mailgun from 'mailgun-js';
import { IConfigProps } from '../config';

export const MAILGUN = 'MAILGUN';

export const mailgunProvider: Provider = {
  provide: MAILGUN,
  useFactory: (config: ConfigService) => {
    const { host, apiKey, domain } = config.get<IConfigProps['mailgun']>(
      'mailgun',
    );

    const mailgun = new Mailgun({
      domain,
      apiKey,
      host,
    });

    return mailgun;
  },
  inject: [ConfigService],
};
