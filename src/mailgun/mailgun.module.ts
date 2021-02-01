import { Module } from '@nestjs/common';
import { MAILGUN, mailgunProvider } from '.';

@Module({
  providers: [mailgunProvider],
  exports: [MAILGUN],
})
export class MailgunModule {}
