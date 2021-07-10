import { Field, ObjectType } from '@nestjs/graphql';
import { CreatableEntity } from 'src/classes/creatables';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@ObjectType()
@Entity()
export class Following extends CreatableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.followers, { eager: true })
  @JoinColumn()
  follower: User;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.following, { eager: true })
  @JoinColumn()
  following: User;
}
