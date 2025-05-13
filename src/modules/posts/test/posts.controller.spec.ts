import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from '../posts.controller';
import { PostsService } from '../posts.service';
import { JwtAuthGuard } from '@/core/guards/auth.guard';
import { CreatePostDto } from '../dto/create-post.dto';
import { GetPostDto } from '../dto/get-post.dto';
import {
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PaginationDto } from '@/core/dto/pagination.dto';

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

  const mockPaginationDto: PaginationDto = {
    limit: 10,
    offset: 0,
  };

  const mockRequest = {
    user: { userId: 1 },
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
            deletePost: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    postsController = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(postsController).toBeDefined();
  });

  describe('getAllPosts', () => {
    it('should return all posts with pagination', async () => {
      jest.spyOn(postsService, 'getAllPosts').mockResolvedValue([mockPost]);

      const result = await postsController.getAllPosts(mockPaginationDto);

      expect(postsService.getAllPosts).toHaveBeenCalledWith(mockPaginationDto);
      expect(result).toEqual([mockPost]);
    });

    it('should return empty array when no posts exist', async () => {
      jest.spyOn(postsService, 'getAllPosts').mockResolvedValue([]);

      const result = await postsController.getAllPosts(mockPaginationDto);

      expect(postsService.getAllPosts).toHaveBeenCalledWith(mockPaginationDto);
      expect(result).toEqual([]);
    });

    it('should throw InternalServerErrorException when service fails', async () => {
      jest
        .spyOn(postsService, 'getAllPosts')
        .mockRejectedValue(
          new InternalServerErrorException('Failed to get posts'),
        );

      await expect(
        postsController.getAllPosts(mockPaginationDto),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        postsController.getAllPosts(mockPaginationDto),
      ).rejects.toThrow('Failed to get posts');
      expect(postsService.getAllPosts).toHaveBeenCalledWith(mockPaginationDto);
    });
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      jest.spyOn(postsService, 'createPost').mockResolvedValue(mockPost);

      const result = await postsController.createPost(
        createPostDto,
        mockRequest,
      );

      expect(postsService.createPost).toHaveBeenCalledWith({
        ...createPostDto,
        author: mockRequest.user.userId,
      });
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest
        .spyOn(postsService, 'createPost')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(
        postsController.createPost(createPostDto, mockRequest),
      ).rejects.toThrow(NotFoundException);
      await expect(
        postsController.createPost(createPostDto, mockRequest),
      ).rejects.toThrow('User not found');
      expect(postsService.createPost).toHaveBeenCalledWith({
        ...createPostDto,
        author: mockRequest.user.userId,
      });
    });

    it('should throw InternalServerErrorException when creation fails', async () => {
      jest
        .spyOn(postsService, 'createPost')
        .mockRejectedValue(
          new InternalServerErrorException('Failed to create post'),
        );

      await expect(
        postsController.createPost(createPostDto, mockRequest),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        postsController.createPost(createPostDto, mockRequest),
      ).rejects.toThrow('Failed to create post');
      expect(postsService.createPost).toHaveBeenCalledWith({
        ...createPostDto,
        author: mockRequest.user.userId,
      });
    });
  });

  describe('deletePost', () => {
    const deletePostDto = { id: 1 };

    it('should delete a post successfully', async () => {
      const successMessage = 'Post deleted successfully';
      jest.spyOn(postsService, 'deletePost').mockResolvedValue(successMessage);

      const result = await postsController.deletePost(
        deletePostDto,
        mockRequest,
      );

      expect(postsService.deletePost).toHaveBeenCalledWith(
        deletePostDto,
        mockRequest.user.userId,
      );
      expect(result).toBe(successMessage);
    });

    it('should throw NotFoundException when post not found', async () => {
      jest
        .spyOn(postsService, 'deletePost')
        .mockRejectedValue(new NotFoundException('Post not found'));

      await expect(
        postsController.deletePost(deletePostDto, mockRequest),
      ).rejects.toThrow(NotFoundException);
      await expect(
        postsController.deletePost(deletePostDto, mockRequest),
      ).rejects.toThrow('Post not found');
      expect(postsService.deletePost).toHaveBeenCalledWith(
        deletePostDto,
        mockRequest.user.userId,
      );
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      jest
        .spyOn(postsService, 'deletePost')
        .mockRejectedValue(
          new ForbiddenException('You are not allowed to delete this post'),
        );

      await expect(
        postsController.deletePost(deletePostDto, mockRequest),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        postsController.deletePost(deletePostDto, mockRequest),
      ).rejects.toThrow('You are not allowed to delete this post');
      expect(postsService.deletePost).toHaveBeenCalledWith(
        deletePostDto,
        mockRequest.user.userId,
      );
    });

    it('should throw InternalServerErrorException when deletion fails', async () => {
      jest
        .spyOn(postsService, 'deletePost')
        .mockRejectedValue(
          new InternalServerErrorException('Failed to delete post'),
        );

      await expect(
        postsController.deletePost(deletePostDto, mockRequest),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        postsController.deletePost(deletePostDto, mockRequest),
      ).rejects.toThrow('Failed to delete post');
      expect(postsService.deletePost).toHaveBeenCalledWith(
        deletePostDto,
        mockRequest.user.userId,
      );
    });
  });
});
