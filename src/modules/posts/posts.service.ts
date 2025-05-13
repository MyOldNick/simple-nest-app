import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { GetPostDto } from './dto/get-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../user/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { DeletePostDto } from './dto/delete-post.dto';
import { PaginationDto } from '@/core/dto/pagination.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getAllPosts({ limit, offset }: PaginationDto): Promise<GetPostDto[]> {
    try {
      const [posts] = await this.postRepository.findAndCount({
        relations: ['author'],
        skip: offset,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });
      return plainToInstance(GetPostDto, posts, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Failed to get posts', error);
      throw new InternalServerErrorException('Failed to get posts');
    }
  }

  async createPost({
    author,
    title,
    content,
  }: CreatePostDto): Promise<GetPostDto> {
    try {
      const foundUser = await this.userRepository.findOne({
        where: { id: author },
      });
      if (!foundUser) {
        throw new NotFoundException('User not found');
      }
      const newPost = await this.postRepository.create({
        content,
        title,
        author: foundUser,
      });
      const createdPost = await this.postRepository.save(newPost);
      return plainToInstance(GetPostDto, createdPost, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Failed to create post', error);
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  async deletePost({ id }: DeletePostDto, userId: number): Promise<string> {
    try {
      const post = await this.postRepository.findOne({
        where: { id },
        relations: ['author'],
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (post.author.id !== userId) {
        throw new ForbiddenException('You are not allowed to delete this post');
      }

      await this.postRepository.delete({ id });

      return 'Post deleted successfully';
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Failed to delete post', error);
      throw new InternalServerErrorException('Failed to delete post');
    }
  }
}
