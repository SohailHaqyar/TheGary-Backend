import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdatePostInput {
  @Field()
  id: string;

  @Field()
  title?: string;

  @Field()
  body?: string;
}
