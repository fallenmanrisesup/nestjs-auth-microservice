import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from './auth.middleware';
import { AuthService } from './auth.service';
import { SessionEntity } from './entities/session.entity';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '../jwt/jwt.module';

@Module({
  imports: [JwtModule, UsersModule, TypeOrmModule.forFeature([SessionEntity])],
  controllers: [AuthController],
  providers: [AuthMiddleware, AuthService],
  exports: [AuthMiddleware, AuthService],
})
export class AuthModule {}
