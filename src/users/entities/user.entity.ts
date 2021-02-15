import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SessionEntity } from '../../auth/entities/session.entity';

@Entity('users')
@Directive('@key(fields: "id")')
@ObjectType('User')
export class UserEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Index()
  email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Index({ unique: true })
  username: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone?: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  password: string;

  @Field()
  @Column({ default: 'en' })
  lang: string;

  @Column({ nullable: true })
  @Field({ defaultValue: false })
  isVerified: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  resetPasswordCode: string;

  @Column({ nullable: true })
  @Field()
  emailVerificationCode?: string;

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
  sessions: SessionEntity[];
}
