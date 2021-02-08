import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
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

  async create(data: CreateUserDto) {
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
  async getAll() {
    return this.userRepo.find();
  }
}
