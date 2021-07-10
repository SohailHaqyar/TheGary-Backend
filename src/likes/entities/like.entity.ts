import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CreatableEntity } from '../../classes/creatables';
import { Post } from 'src/posts/entities/post.entity';

@ObjectType()
@Entity()
export class Like extends CreatableEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.likes)
  post: Post;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.likes, { eager: true })
  user: User;
}
