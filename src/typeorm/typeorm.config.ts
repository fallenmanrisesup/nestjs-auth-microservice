import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { EntitySchema } from 'typeorm';
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

    const entities: (Function | string | EntitySchema<any>)[] = [UserEntity];

    const opts: TypeOrmModuleOptions = {
      ssl,
      database,
      username,
      password,
      port,
      host,
      type: 'postgres',
      entities: [SessionEntity, UserEntity],
    };

    return opts;
  }
}
