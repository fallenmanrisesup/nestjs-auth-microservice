import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { IConfigProps } from '../config';
import { UserEntity } from '../users/entities/user.entity';
import { SessionEntity } from '../auth/entities/session.entity';
import { SmsTokenEntity } from '../auth/entities/sms-token.entity';

@Injectable()
export class TypeormConfig implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const { envMode } = this.config.get<IConfigProps['app']>('app');

    const { database, username, password, port, host, ssl } = this.config.get<
      IConfigProps['postgres']
    >('postgres');

    const entities = [SessionEntity, UserEntity, SmsTokenEntity];

    envMode === 'test' ? 'sqlite' : 'postgres';

    const testOpts: TypeOrmModuleOptions = {
      database: '.DS_Store',
      type: 'sqlite',
      entities,
    };

    const opts: TypeOrmModuleOptions = {
      ssl,
      database,
      username,
      password,
      port,
      host,
      synchronize: true,
      type: 'postgres',
      entities,
    };

    return envMode === 'test' ? testOpts : opts;
  }
}
