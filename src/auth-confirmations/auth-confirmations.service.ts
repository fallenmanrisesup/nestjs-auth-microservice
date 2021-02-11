import { Inject, Injectable } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { randomBytes } from 'crypto';
import {
  NotificationServiceEvents,
  NOTIFICATIONS_SERVICE_TOKEN,
} from './providers/notification-service.provider';
import {
  NotificationPayload,
  NotificationsType,
  NotificationTransport,
} from '../core/event-payloads';
import { UserEntity } from '../users/entities/user.entity';
import { UserService } from '../users/users.service';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { IncorrectEmailCodeException } from './exceptions/incorrect-email-code.exception';
import { IncorrectCredentialsException } from '../auth/excepctions/incorrect-credentials.exception';
import { RecoverPasswordDto } from '../auth/dtos/recover-password.dto';

@Injectable()
export class AuthConfirmationsService {
  constructor(
    @Inject(NOTIFICATIONS_SERVICE_TOKEN)
    private readonly notificationService: ClientRMQ,
    private readonly userService: UserService,
  ) {}

  async createPasswordRecovery({ email }: RecoverPasswordDto) {
    const code = this.createCode();

    const foundUser = await this.userService.find({ where: { email } });

    if (!foundUser) {
      throw new IncorrectCredentialsException();
    }

    await this.userService.updateUser(
      { id: foundUser.id },
      { resetPasswordCode: code },
    );

    await this.sendPasswordRecovery(foundUser, code);
  }

  async verifyEmail({ code }: VerifyEmailDto) {
    const foundUser = await this.userService.find({
      where: { emailVerificationCode: code },
    });

    if (!foundUser) {
      throw new IncorrectEmailCodeException();
    }

    await this.userService.updateUser(
      { id: foundUser.id },
      { isVerified: true, emailVerificationCode: null },
    );
  }

  createCode(bytesLen: number = 6) {
    return randomBytes(bytesLen).toString('hex');
  }

  async sendEmailConfirmation({ id, lang }: UserEntity, code: string) {
    const payload: NotificationPayload = {
      userId: id,
      lang,
      params: { code },
      type: NotificationsType.EMAIL_CONFIRMATION,
      transports: [NotificationTransport.EMAIL],
    };

    await this.notificationService.emit(
      NotificationServiceEvents.CREATE_USER_NOTIFICATION,
      JSON.stringify(payload),
    );
  }

  async sendPasswordRecovery({ id, lang }: UserEntity, code: string) {
    const payload: NotificationPayload = {
      userId: id,
      lang,
      params: { code },
      type: NotificationsType.PASSWORD_RECOVERY,
      transports: [NotificationTransport.EMAIL],
    };

    await this.notificationService.emit(
      NotificationServiceEvents.CREATE_USER_NOTIFICATION,
      JSON.stringify(payload),
    );
  }
}
