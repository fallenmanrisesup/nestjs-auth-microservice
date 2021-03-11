import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import {
  QuizServiceClientOptionService,
  QUIZ_SERVICE_TOKEN,
} from './providers/quiz-service.client';
import { UsersController } from './users.controller';
import { UserResolver } from './users.resolver';
import { UserService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    ClientsModule.registerAsync([
      {
        name: QUIZ_SERVICE_TOKEN,
        useClass: QuizServiceClientOptionService,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UsersModule {}
