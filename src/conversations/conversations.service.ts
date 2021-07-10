import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Any, In, Repository } from 'typeorm';
import { pubSub } from './conversations.resolver';
import { CreateConversationInput } from './dto/create-conversation.dto';
import { CreateMessageInput } from './dto/create-message.dto';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/messages.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createConversation(createConversationInput: CreateConversationInput) {
    const { name, userIds } = createConversationInput;
    let userIdArr: Array<Partial<User>> = userIds.map((id) => ({
      id,
    }));

    const convo = await this.conversationRepository.findOne({
      where: { name },
    });
    if (convo) {
      throw new BadRequestException(`Duplicate Conversation`);
    }
    const newConversation = await this.conversationRepository.save(
      this.conversationRepository.create({
        users: userIdArr,
        name,
      }),
    );

    return newConversation;
  }

  async getConversations() {
    const result = await this.conversationRepository.find({
      relations: ['users', 'messages'],
    });
    return result;
  }

  async getUserConversations(userId: string) {
    const result = await this.conversationRepository.find({
      relations: ['users', 'messages'],
    });
    let conversations = [];
    for (const conversation of result) {
      for (const user of conversation.users) {
        if (user.id === userId) {
          conversations.push(conversation);
        }
      }
    }
    return conversations;
  }

  async message(createMessageInput: CreateMessageInput): Promise<Message> {
    const { body, userId, conversationId } = createMessageInput;
    const user = await this.usersRepository.findOne(userId);
    const conversation = await this.conversationRepository.findOne(
      conversationId,
    );
    const message = await this.messagesRepository.save(
      this.messagesRepository.create({
        body,
        user,
        conversation,
      }),
    );

    pubSub.publish('messageAdded', { messageAdded: message });

    return message;
  }

  async getConversationById(id: string) {
    try {
      return await this.conversationRepository.findOne(id, {
        relations: ['users', 'messages'],
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
