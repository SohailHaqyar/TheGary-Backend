import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async likePost(postId: string, user: User) {
    /**
     * Likes the post if you haven't already.
     */
    let updated_post;
    const post = await this.postRepository.findOne({ where: { id: postId } });
    const likeExists = post.likes.find((like) => like.user.id === user.id);

    if (!likeExists) {
      const like = await this.likesRepository.save(
        this.likesRepository.create({
          post: { id: postId },
          user,
        }),
      );
      post.likes.push(like);
      updated_post = await this.postRepository.save(post);
    } else {
      post.likes = post.likes.filter((like) => like.id !== likeExists.id);
      updated_post = await this.postRepository.save(post);
    }
    return updated_post;
  }
}
