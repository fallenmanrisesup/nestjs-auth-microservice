import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { IConfigProps } from '../config';
import { UserEntity } from '../users/entities/user.entity';
import { SessionEntity } from '../auth/entities/session.entity';

@Injectable()
export class TypeormConfig implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const { database, username, password, port, host, ssl } = this.config.get<
      IConfigProps['postgres']
    >('postgres');

    const opts: TypeOrmModuleOptions = {
      ssl,
      database,
      username,
      password,
      port,
      host,
      synchronize: true,
      type: 'postgres',
      entities: [SessionEntity, UserEntity],
    };

    return opts;
  }
}
