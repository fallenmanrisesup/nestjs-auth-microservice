import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { UsersModule } from '../users/users.module';
import { AuthConfirmationsService } from './auth-confirmations.service';
import {
  NotificationServiceClientOptionService,
  NOTIFICATIONS_SERVICE_TOKEN,
} from './providers/notification-service.provider';

@Module({
  imports: [
    UsersModule,
    ClientsModule.registerAsync([
      {
        name: NOTIFICATIONS_SERVICE_TOKEN,
        useClass: NotificationServiceClientOptionService,
      },
    ]),
  ],
  providers: [AuthConfirmationsService],
  exports: [AuthConfirmationsService],
})
export class AuthConfirmationsModule {}
