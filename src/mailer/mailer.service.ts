import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailgun from 'mailgun-js';
import { IConfigProps } from '../config';
import { MAILGUN } from '../mailgun';
import { SendMailDto } from './dtos/send-mail.dto';

@Injectable()
export class MailerService {
  constructor(
    @Inject(MAILGUN)
    private mailgun: Mailgun.Mailgun,
    private config: ConfigService,
  ) {}

  async send(payload: SendMailDto): Promise<void> {
    const { to, subject, content } = payload;

    const { from } = this.config.get<IConfigProps['mailgun']>('mailgun');

    await this.mailgun.messages().send({
      to,
      from,
      subject,
      html: content,
    });
  }
}
