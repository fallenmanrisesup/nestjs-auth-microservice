import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { SessionEntity } from '../../auth/entities/session.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
@Directive('@key(fields: "id")')
@ObjectType('User')
export class UserEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  @Index({ unique: true })
  email: string;

  @Field()
  @Column()
  @Index({ unique: true })
  username: string;

  @Column()
  password: string;

  @Field()
  @Column({ default: 'en' })
  lang: string;

  @Field(() => Date)
  @CreateDateColumn()
  created: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updated: Date;

  @OneToMany(
    () => SessionEntity,
    s => s.user,
  )
  sessions: SessionEntity[] = [];
}