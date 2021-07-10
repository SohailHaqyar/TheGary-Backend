import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreatePostInput } from './dto/create-post.dto';
import { UpdatePostInput } from './dto/update-post.dto';
import { DeleteResponse } from './posts.resolver';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async findAll(limit: number = 10): Promise<Post[]> {
    const results = await this.postRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: limit,
    });
    return results;
  }

  async getAllTrending(): Promise<Post[]> {
    const posts = await this.findAll();
    let trending = posts.filter((post) => post.comments.length > 1);

    return trending;
  }

  async findOne(postId: string): Promise<Post> {
    const result = await this.postRepository
      .createQueryBuilder('post')
      .where('post.id = :postId', { postId })
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentsUser')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('likes.user', 'likesUser')
      .leftJoinAndSelect('post.user', 'user')
      .orderBy('comments.created_at', 'DESC')
      .getOne();

    return result;
  }

  async create(createPostInput: CreatePostInput, user: User): Promise<Post> {
    return await this.postRepository.save(
      this.postRepository.create({
        ...createPostInput,
        user,
      }),
    );
  }

  async checkOwnership(
    postId: string,
    userId: string,
    returnPost?: boolean,
  ): Promise<Post | boolean> {
    // Query for the post with the user's id
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
        user: { id: userId },
      },
    });
    if (returnPost) {
      return post;
    } else {
      return !!post;
    }
  }

  async update(
    updatePostInput: UpdatePostInput,
    user: User,
  ): Promise<Partial<Post>> {
    const isOwner = await this.checkOwnership(updatePostInput.id, user.id);
    if (!isOwner) {
      throw new UnauthorizedException(
        `Sorry mate that post doesn't belong to you`,
      );
    }

    return await this.postRepository.save({
      id: updatePostInput.id,
      ...updatePostInput,
    });
  }

  async delete(id: string, user: User): Promise<DeleteResponse> {
    const post = (await this.checkOwnership(id, user.id, true)) as Post;
    if (!post) {
      throw new UnauthorizedException(`Post Not Found`);
    }

    const deleted = await this.postRepository.delete(id);
    return {
      deleted: !!deleted,
      post,
    };
  }
}
