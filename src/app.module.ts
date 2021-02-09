import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';
import { ConfigModule } from './config/config.module';
import { PromModule } from '@digikare/nestjs-prom';
import { GraphQLFederationModule, GraphQLModule } from '@nestjs/graphql';
import { name, version } from '../package.json';
import { GraphqlModule } from './graphql/graphql.module';
import { GqlConfigService } from './graphql/graphql-config.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from './typeorm/typeorm.config';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './jwt/jwt.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { EncryptionModule } from './encryption/encryption.module';

@Module({
  imports: [
    PromModule.forRoot({
      withDefaultsMetrics: true,
      defaultLabels: {
        app: name,
        version,
      },
    }),
    GraphQLFederationModule.forRootAsync({
      useFactory: (cfg: GqlConfigService) => cfg.createGqlOptions(),
      imports: [GraphqlModule],
      inject: [GqlConfigService],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useClass: TypeormConfig,
    }),
    HealthModule,
    ConfigModule,
    GraphqlModule,
    UsersModule,
    AuthModule,
    JwtModule,
    EncryptionModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
