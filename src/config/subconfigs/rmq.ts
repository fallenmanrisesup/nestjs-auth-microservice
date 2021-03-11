import { registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

export interface IRmqConfigProps {
  url: string;
  serviceQueueName: string;
  prefetchCount: number;
  serviceQueues: {
    notification: string;
    quiz: string;
  };
}

export default registerAs<ConfigFactory<IRmqConfigProps>>('rmq', () => ({
  url: process.env.RMQ_URL,
  serviceQueueName: process.env.RMQ_SERVICE_QUEUE_NAME || 'user-service',
  prefetchCount: +process.env.RMQ_SERVICE_PREFETCH || 100,
  serviceQueues: {
    notification:
      process.env.RMQ_NOTIFICATION_SERVICE_QUEUE_NAME || 'notification-service',
    quiz: process.env.RMQ_QUIZ_SERVICE_QUEUE_NAME || 'quiz-service',
  },
}));
