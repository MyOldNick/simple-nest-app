import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { Repository } from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { GetUserDto } from '@/modules/user/dto/get-user.dto';
import { CreatePostDto } from '../dto/create-post.dto';

describe('PostsService', () => {
  let postsService: PostsService;
  let postRepository: jest.Mocked<Repository<Post>>;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 1,
    firstname: 'John',
    lastname: 'Doe',
    password: 'hashedpassword',
    email: 'test@gmail.com',
    posts: [],
    hashPasswordBeforeInsert: jest.fn(),
  };

  const getUserDto = plainToInstance(GetUserDto, mockUser, {
    excludeExtraneousValues: true,
  });

  const mockPost: Post = {
    id: 1,
    title: 'Test Post',
    content: 'This is a test post',
    author: mockUser,
  };

  const createPostDto = plainToInstance(CreatePostDto, mockPost, {
    excludeExtraneousValues: true,
  });

  const createdPostDto = {
    ...createPostDto,
    author: mockUser,
  };

  const expectedPostDto = {
    ...mockPost,
    author: getUserDto,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn()
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn()
          },
        },
      ],
    }).compile();

    postsService = module.get<PostsService>(PostsService);
    postRepository = module.get<Repository<Post>>(
      getRepositoryToken(Post),
    ) as jest.Mocked<Repository<Post>>;
    userRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    ) as jest.Mocked<Repository<User>>;
  });

  it('should be defined', () => {
    expect(postsService).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      postRepository.create.mockReturnValue(mockPost);
      postRepository.save.mockResolvedValue(mockPost);
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await postsService.createPost(createPostDto);

      expect(postRepository.create).toHaveBeenCalledWith(createdPostDto);
      expect(postRepository.save).toHaveBeenCalledWith(mockPost);
      expect(result).toEqual(expectedPostDto);
    });
  });

  describe('getAllPosts', () => {
    it('should return all posts', async () => {
      postRepository.find.mockResolvedValue([mockPost]);

      const result = await postsService.getAllPosts();

      expect(postRepository.find).toHaveBeenCalledWith({
        relations: ['author'],
      });
      expect(result).toEqual([expectedPostDto]);
    });
  });

  it('should throw an error', async () => {
    postRepository.find.mockRejectedValue(new Error('Error finding posts'));

    await expect(postsService.getAllPosts()).rejects.toThrow(
      'Failed to get posts',
    );
  });

  describe('deletePost', () => {
    it('should delete a post when user is the author', async () => {
      postRepository.findOne.mockResolvedValue(mockPost);
      postRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result = await postsService.deletePost({ id: 1 }, mockUser.id);

      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['author'],
      });
      expect(postRepository.delete).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBe('Post deleted successfully');
    });

    it('should throw NotFoundException when post is not found', async () => {
      postRepository.findOne.mockResolvedValue(null);

      await expect(postsService.deletePost({ id: 999 }, mockUser.id)).rejects.toThrow('Post not found');
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      postRepository.findOne.mockResolvedValue(mockPost);

      await expect(postsService.deletePost({ id: 1 }, 999)).rejects.toThrow('You are not allowed to delete this post');
    });

    it('should throw InternalServerErrorException when deletion fails', async () => {
      postRepository.findOne.mockResolvedValue(mockPost);
      postRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(postsService.deletePost({ id: 1 }, mockUser.id)).rejects.toThrow('Failed to delete post');
    });
  });
});
