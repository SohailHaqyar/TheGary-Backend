import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Post } from '../posts/entities/post.entity';
import { GetUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-auth';
import { User } from '../users/entities/user.entity';
import { LikesService } from './likes.service';

@Resolver()
@UseGuards(GqlAuthGuard)
export class LikesResolver {
  constructor(private likesService: LikesService) {}

  @Mutation(() => Post)
  likePost(
    @GetUser() user: User,
    @Args({ name: 'postId', type: () => String }) postId: string,
  ) {
    return this.likesService.likePost(postId, user);
  }
}
