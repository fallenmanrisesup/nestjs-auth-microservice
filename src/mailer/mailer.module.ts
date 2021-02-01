import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { MailgunModule } from '../mailgun/mailgun.module';
import { MailerController } from './mailer.controller';
import { MailerService } from './mailer.service';

@Module({
  imports: [MailgunModule, ConfigModule],
  controllers: [MailerController],
  providers: [MailerService],
})
export class MailerModule {}
