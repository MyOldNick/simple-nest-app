import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from '../posts.controller';
import { PostsService } from '../posts.service';
import { JwtAuthGuard } from '@/core/guards/auth.guard';
import { CreatePostDto } from '../dto/create-post.dto';
import { GetPostDto } from '../dto/get-post.dto';
import { ExecutionContext } from '@nestjs/common';

describe('PostsController', () => {
  let postsController: PostsController;
  let postsService: PostsService;

  const mockPost: GetPostDto = {
    id: 1,
    title: 'Test Post',
    content: 'This is a test post',
    author: {
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      email: 'test@gmail.com',
    },
  };

  const createPostDto: CreatePostDto = {
    title: 'Test Post',
    content: 'This is a test post',
    author: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            getAllPosts: jest.fn(),
            createPost: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => true,
      })
      .compile();

    postsController = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(postsController).toBeDefined();
  });

  describe('getAllPosts', () => {
    it('should return all posts', async () => {
      jest.spyOn(postsService, 'getAllPosts').mockResolvedValue([mockPost]);

      const result = await postsController.getAllPosts();

      expect(postsService.getAllPosts).toHaveBeenCalled();
      expect(result).toEqual([mockPost]);
    });

    it('should throw an error if service fails', async () => {
      jest
        .spyOn(postsService, 'getAllPosts')
        .mockRejectedValue(new Error('Service error'));

      await expect(postsController.getAllPosts()).rejects.toThrow(
        'Service error',
      );
      expect(postsService.getAllPosts).toHaveBeenCalled();
    });
  });

  describe('createPost', () => {
    it('should create a post', async () => {
      jest.spyOn(postsService, 'createPost').mockResolvedValue(mockPost);

      const result = await postsController.createPost(createPostDto, {
        user: { userId: 1 },
      });

      expect(postsService.createPost).toHaveBeenCalledWith({
        ...createPostDto,
        author: 1,
      });
      expect(result).toEqual(mockPost);
    });

    it('should throw an error if service fails', async () => {
      jest
        .spyOn(postsService, 'createPost')
        .mockRejectedValue(new Error('Service error'));

      await expect(
        postsController.createPost(createPostDto, { user: { userId: 1 } }),
      ).rejects.toThrow('Service error');
      expect(postsService.createPost).toHaveBeenCalledWith({
        ...createPostDto,
        author: 1,
      });
    });
  });
});
