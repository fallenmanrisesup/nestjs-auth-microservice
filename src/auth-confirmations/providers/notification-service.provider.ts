import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientsModuleOptionsFactory,
  RmqOptions,
  Transport,
} from '@nestjs/microservices';
import { IConfigProps } from '../../config';

@Injectable()
export class NotificationServiceClientOptionService
  implements ClientsModuleOptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createClientOptions(): RmqOptions {
    const { serviceQueues, url } = this.configService.get<IConfigProps['rmq']>(
      'rmq',
    );

    return {
      transport: Transport.RMQ,
      options: {
        urls: [url],
        queue: 'notification-service',
      },
    };
  }
}

export const NOTIFICATIONS_SERVICE_TOKEN = 'NOTIFICATIONS_SERVICE_TOKEN';

export enum NotificationServiceEvents {
  CREATE_USER_NOTIFICATION = 'CREATE_USER_NOTIFICATION',
}
