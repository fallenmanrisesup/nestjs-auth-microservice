import { Inject, Injectable } from '@nestjs/common';
import { ClientRMQ } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizServiceEvents } from '../core/events';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { ListUsersArgs, ListUsersResult } from './dtos/users-pagination';
import { UserEntity } from './entities/user.entity';
import { UserRoles } from './enums/user.roles';
import { UserNotFoundException } from './exceptions/not-found.exception';
import { QUIZ_SERVICE_TOKEN } from './providers/quiz-service.client';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @Inject(QUIZ_SERVICE_TOKEN)
    private readonly quizService: ClientRMQ,
  ) {}

  async find(opts: FindOneOptions<UserEntity>) {
    return this.userRepo.findOne(opts);
  }

  async createRespondent() {
    const user = await this.create({
      isRespondent: true,
      role: UserRoles.RESPONDENT,
    });

    return user;
  }

  async create(data: DeepPartial<UserEntity>) {
    const created = this.userRepo.create(data);
    const user = await this.userRepo.save(created);
    await this.quizService.emit(
      QuizServiceEvents.CREATE_QUIZ_USER,
      JSON.stringify(user),
    );
    return user;
  }

  async findByEmailOrUsername(usernameOrEmail: string): Promise<UserEntity> {
    return this.userRepo.findOne({
      where: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });
  }

  async delete(id: string) {
    const user = await this.userRepo.findOne(id);

    if (!user) {
      throw new UserNotFoundException(id);
    }

    await this.userRepo.remove(user);

    return user;
  }

  async list({
    page,
    perPage,
    orderBy,
  }: ListUsersArgs): Promise<ListUsersResult> {
    const options: FindManyOptions<UserEntity> = {};

    if (orderBy) {
      options.order = {
        [orderBy.field]: orderBy.order,
      };
    }

    const items = await this.userRepo.find({
      ...options,
      skip: page * perPage,
      take: perPage,
    });

    const total = await this.userRepo.count({ ...options });

    return { items, total, hasMore: page * perPage + perPage < total };
  }

  async updateUser(
    opts: Partial<UserEntity>,
    data: QueryDeepPartialEntity<UserEntity>,
  ) {
    return this.userRepo.update(opts, data);
  }
}
