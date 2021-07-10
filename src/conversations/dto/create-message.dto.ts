import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateMessageInput {
  @Field()
  conversationId: string;

  @Field()
  userId: string;

  @Field()
  body: string;
}
