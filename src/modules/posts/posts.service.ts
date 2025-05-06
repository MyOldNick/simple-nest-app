import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { GetPostDto } from './dto/get-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../user/entities/user.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getAllPosts(): Promise<GetPostDto[]> {
    try {
      const posts = await this.postRepository.find({ relations: ['author'] });
      return plainToInstance(GetPostDto, posts, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Failed to get posts', error);
      throw new InternalServerErrorException('Failed to get posts');
    }
  }

  async createPost({ author, title, content }: CreatePostDto): Promise<GetPostDto> {
    try {
      const foundUser = await this.userRepository.findOne({
        where: { id: author },
      });
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
      console.error('Failed to create post', error);
      throw new InternalServerErrorException('Failed to create post');
    }
  }
}
