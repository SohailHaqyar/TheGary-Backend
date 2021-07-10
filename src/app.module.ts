import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { Post } from './posts/entities/post.entity';
import { LikesModule } from './likes/likes.module';
import { CommentsModule } from './comments/comments.module';
import { Like } from './likes/entities/like.entity';
import { Comment } from './comments/entities/comment.entity';
import { Following } from './users/entities/follow.entity';
import { ConversationsModule } from './conversations/conversations.module';
import { Message } from './conversations/entities/messages.entity';
import { Conversation } from './conversations/entities/conversation.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      // host: 'localhost',
      // port: 5432,
      // username: 'root',
      // password: 'root',
      // database: 'db',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      // url:"postgres://zxpquifznttjut:202b2e8c55d08c7758f39862cb25964befa6e76936d807745e312db33b6569eb@ec2-54-220-195-236.eu-west-1.compute.amazonaws.com:5432/dftm9i1j16rd66"
      entities: [User, Post, Like, Comment, Following, Message, Conversation],
      synchronize: true,
      logging: false,
      retryAttempts: 1,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      buildSchemaOptions: {
        dateScalarMode: 'timestamp',
      },
      installSubscriptionHandlers: true,
      introspection: true,
      playground: true,
    }),
    UsersModule,
    AuthModule,
    PostsModule,
    LikesModule,
    CommentsModule,
    ConversationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
