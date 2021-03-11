import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CreateUserInput } from './dtos/create-user.dto';
import { ListUsersArgs, ListUsersResult } from './dtos/users-pagination';
import { UserEntity } from './entities/user.entity';
import { UserNotFoundException } from './exceptions/not-found.exception';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async find(opts: FindOneOptions<UserEntity>) {
    return this.userRepo.findOne(opts);
  }

  async createRespondent() {
    const user = this.userRepo.create({ isRespondent: true });
    return this.userRepo.save(user);
  }

  async create(data: CreateUserInput) {
    const created = this.userRepo.create(data);
    return this.userRepo.save(created);
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
