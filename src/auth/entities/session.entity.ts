import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserEntity } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sessions')
@ObjectType('Session')
export class SessionEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  refreshToken: string;

  @Column()
  @Field()
  deviceToken: string;

  @Column()
  @Field()
  agent: string;

  @Column()
  @Field()
  ip: string;

  @Column()
  @Field()
  expires: Date;

  @CreateDateColumn()
  @Field()
  created: Date;

  @UpdateDateColumn()
  @Field()
  updated: Date;

  @ManyToOne(
    () => UserEntity,
    u => u.sessions,
    { onDelete: 'CASCADE', eager: true },
  )
  user: UserEntity;
}
