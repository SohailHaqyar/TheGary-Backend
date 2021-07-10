import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { LikesService } from './likes.service';
import { LikesResolver } from './likes.resolver';
import { Post } from '../posts/entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Post])],
  providers: [LikesService, LikesResolver],
})
export class LikesModule {}
