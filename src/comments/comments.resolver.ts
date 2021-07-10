import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth';
import { GetUser } from '../auth/current-user.decorator';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CommentsService } from './comments.service';
import { CreateCommentInput } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

@Resolver()
@UseGuards(GqlAuthGuard)
export class CommentsResolver {
  constructor(private commentsService: CommentsService) {}

  @Query(() => [Comment])
  comments(@Args({ name: 'postId', type: () => String }) postId: string) {
    return this.commentsService.getAllUserComments(postId);
  }

  @Mutation(() => Comment)
  addComment(
    @GetUser() user: User,
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
  ) {
    return this.commentsService.create(createCommentInput, user);
  }

  @Mutation(() => String)
  removeComment(
    @GetUser() user: User,
    @Args({ name: 'commentId', type: () => String }) commentId: string,
  ) {
    return this.commentsService.delete(commentId, user);
  }
}
