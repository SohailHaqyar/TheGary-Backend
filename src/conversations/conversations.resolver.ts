import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { PubSub } from 'graphql-subscriptions';
import { GetUser } from 'src/auth/current-user.decorator';
import { GqlAuthGuard } from 'src/auth/guards/gql-auth';
import { User } from 'src/users/entities/user.entity';
import { ConversationsService } from './conversations.service';
import { CreateConversationInput } from './dto/create-conversation.dto';
import { CreateMessageInput } from './dto/create-message.dto';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/messages.entity';

export const pubSub = new PubSub();

@Resolver(() => Conversation)
export class ConversationsResolver {
  constructor(private conversationService: ConversationsService) {}

  @Subscription((returns) => Message, {
    filter: (payload, variables) =>
      payload.messageAdded.conversation.id === variables.conversationId,
  })
  messageAdded(@Args('conversationId') conversationId: string) {
    return pubSub.asyncIterator('messageAdded');
  }

  @Query(() => [Conversation])
  getConvos() {
    return this.conversationService.getConversations();
  }

  @Query(() => [Conversation])
  @UseGuards(GqlAuthGuard)
  getUserConvos(@GetUser() user: User) {
    return this.conversationService.getUserConversations(user.id);
  }

  @Mutation(() => Conversation)
  createConversation(
    @Args('createConversationInput')
    createConversationInput: CreateConversationInput,
  ) {
    return this.conversationService.createConversation(createConversationInput);
  }

  @Mutation(() => Message)
  message(
    @Args('createMessageInput')
    createMessageInput: CreateMessageInput,
  ) {
    return this.conversationService.message(createMessageInput);
  }

  @Query(() => Conversation)
  getConvoById(
    @Args({ name: 'conversationId', type: () => String })
    conversationId: string,
  ) {
    return this.conversationService.getConversationById(conversationId);
  }
}
