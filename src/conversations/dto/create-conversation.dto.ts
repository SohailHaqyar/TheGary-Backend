import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateConversationInput {
  @Field(() => [String])
  userIds: string[];

  @Field()
  name: string;
}
