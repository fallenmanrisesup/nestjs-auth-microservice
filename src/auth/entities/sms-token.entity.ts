import { Field } from '@nestjs/graphql';
import { UserEntity } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sms_tokens')
export class SmsTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  token: string;

  @Column()
  @Field()
  phone: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
    eager: true,
    nullable: true,
  })
  @Field(() => UserEntity, { nullable: true })
  user?: UserEntity;

  @Column()
  @Field()
  expires: Date;

  @CreateDateColumn()
  @Field()
  created: Date;

  @UpdateDateColumn()
  @Field()
  updated: Date;
}
