import { UseGuards } from '@nestjs/common';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  Field,
  ObjectType,
} from '@nestjs/graphql';
import { GetUser } from 'src/auth/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth';
import { User } from 'src/users/entities/user.entity';
import { CreatePostInput } from './dto/create-post.dto';
import { UpdatePostInput } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PostsService } from './posts.service';

@ObjectType()
export class DeleteResponse {
  @Field(() => Post)
  post: Post;

  @Field(() => Boolean)
  deleted: boolean;
}

@Resolver(() => Post)
@UseGuards(GqlAuthGuard)
export class PostsResolver {
  constructor(private postsService: PostsService) {}
  @Query(() => [Post], { nullable: true })
  @UseGuards(GqlAuthGuard)
  findAll() {
    return this.postsService.findAll();
  }

  @Query(() => [Post], { nullable: true })
  @UseGuards(GqlAuthGuard)
  findAllTrendingPosts() {
    return this.postsService.getAllTrending();
  }

  @Query(() => Post)
  findOnePost(@Args({ name: 'postId', type: () => String }) postId: string) {
    return this.postsService.findOne(postId);
  }

  @Mutation(() => Post)
  createPost(
    @GetUser() user: User,
    @Args('createPostInput') createPostInput: CreatePostInput,
  ) {
    return this.postsService.create(createPostInput, user);
  }

  @Mutation(() => Post)
  updatePost(
    @GetUser() user: User,
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
  ) {
    return this.postsService.update(updatePostInput, user);
  }

  @Mutation(() => DeleteResponse)
  deletePost(
    @GetUser() user: User,
    @Args({ name: 'postId', type: () => String }) postId: string,
  ) {
    return this.postsService.delete(postId, user);
  }
}
