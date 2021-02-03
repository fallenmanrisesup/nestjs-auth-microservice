import { Global, Module } from '@nestjs/common';
import { ConfigService, ConfigModule as NestConfig } from '@nestjs/config';
import subconfigs from './subconfigs';

@Global()
@Module({
  imports: [
    NestConfig.forRoot({
      load: subconfigs,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
