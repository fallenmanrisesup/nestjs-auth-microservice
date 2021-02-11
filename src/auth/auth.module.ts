import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from './auth.middleware';
import { AuthService } from './auth.service';
import { SessionEntity } from './entities/session.entity';
import { AuthController } from './auth.controller';
import { RestAuthGuard } from './guards/rest-auth.guard';
import { GraphQLAuthGuard } from './guards/graphql-auth.guard';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '../jwt/jwt.module';
import { AuthConfirmationsModule } from '../auth-confirmations/auth-confirmations.module';

@Module({
  imports: [
    AuthConfirmationsModule,
    JwtModule,
    UsersModule,
    TypeOrmModule.forFeature([SessionEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthMiddleware, AuthService, RestAuthGuard, GraphQLAuthGuard],
  exports: [AuthMiddleware, AuthService, RestAuthGuard, GraphQLAuthGuard],
})
export class AuthModule {}
