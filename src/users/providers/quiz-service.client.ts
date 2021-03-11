import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientsModuleOptionsFactory,
  RmqOptions,
  Transport,
} from '@nestjs/microservices';
import { IConfigProps } from '../../config';

@Injectable()
export class QuizServiceClientOptionService
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
        queue: serviceQueues.quiz || 'quiz-service',
        noAck: true,
      },
    };
  }
}

export const QUIZ_SERVICE_TOKEN = 'QUIZ_SERVICE_TOKEN';
