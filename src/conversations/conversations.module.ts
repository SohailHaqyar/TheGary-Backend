import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ConversationsResolver } from './conversations.resolver';
import { ConversationsService } from './conversations.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/messages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, User])],
  providers: [ConversationsResolver, ConversationsService],
})
export class ConversationsModule {}
