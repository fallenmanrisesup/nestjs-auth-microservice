import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { IConfigProps } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  // const rmqOptions = config.get<IConfigProps['rmq']>('rmq');

  // await app.connectMicroservice<RmqOptions>({
  //   transport: Transport.RMQ,
  //   options: {
  //     urls: [rmqOptions.url],
  //     queue: rmqOptions.serviceQueueName,
  //     prefetchCount: rmqOptions.prefetchCount,
  //   },
  // });

  // await app.startAllMicroservicesAsync();

  await app.listen(config.get('app.port'));
}
bootstrap();
