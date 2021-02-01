import { Channel, Message } from 'amqplib';
import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { NotificationProcessorEvents } from '../core/events';
import { SendMailDto } from './dtos/send-mail.dto';
import { MailerService } from './mailer.service';

@Controller()
export class MailerController {
  private readonly logger = new Logger('MailerController');

  constructor(private readonly mailerService: MailerService) {}

  @EventPattern(NotificationProcessorEvents.PROCESS_EMAIL_NOTIFICATION)
  async processEmailNotification(
    @Payload() payload: SendMailDto,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel: Channel = context.getChannelRef();
    const originalMsg = context.getMessage() as Message;
    try {
      await this.mailerService.send(payload);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(error);
      // Requeue
      channel.nack(originalMsg, true, true);
    }
  }
}
