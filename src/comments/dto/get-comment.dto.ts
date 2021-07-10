import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetCommentInput {
  @Field()
  postId: string;

  @Field()
  userId: string;
}
