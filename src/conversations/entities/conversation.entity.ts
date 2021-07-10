import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './messages.entity';

@ObjectType()
@Entity()
export class Conversation extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: true })
  name: string;

  @Field(() => [User])
  @ManyToMany(() => User)
  @JoinTable()
  users: User[];

  @Field(() => [Message])
  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}
