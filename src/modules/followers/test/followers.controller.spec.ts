import { Test, TestingModule } from '@nestjs/testing';
import { FollowersController } from '../followers.controller';
import { FollowersService } from '../followers.service';
import { JwtAuthGuard } from '@/core/guards/auth.guard';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PaginationDto } from '@/core/dto/pagination.dto';

describe('FollowersController', () => {
  let controller: FollowersController;
  let service: FollowersService;

  const mockFollowersService = {
    follow: jest.fn(),
    unfollow: jest.fn(),
    countFollowers: jest.fn(),
    getFollowers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowersController],
      providers: [
        {
          provide: FollowersService,
          useValue: mockFollowersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FollowersController>(FollowersController);
    service = module.get<FollowersService>(FollowersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('countFollowers', () => {
    it('should return the number of followers', async () => {
      const userId = '1';
      const expectedCount = 5;
      mockFollowersService.countFollowers.mockResolvedValue(expectedCount);

      const result = await controller.countFollowers(userId);
      expect(result).toBe(expectedCount);
      expect(service.countFollowers).toHaveBeenCalledWith(1);
    });

    it('should throw InternalServerErrorException when count fails', async () => {
      mockFollowersService.countFollowers.mockRejectedValue(
        new InternalServerErrorException('Failed to count followers'),
      );

      await expect(controller.countFollowers('1')).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(controller.countFollowers('1')).rejects.toThrow(
        'Failed to count followers',
      );
    });
  });

  describe('getFollowers', () => {
    it('should return a list of followers', async () => {
      const userId = '1';
      const pagination: PaginationDto = { offset: 0, limit: 10 };
      const expectedFollowers = [
        { follower: { id: 2, username: 'user2' } },
        { follower: { id: 3, username: 'user3' } },
      ];
      mockFollowersService.getFollowers.mockResolvedValue(expectedFollowers);

      const result = await controller.getFollowers(userId, pagination);
      expect(result).toEqual(expectedFollowers);
      expect(service.getFollowers).toHaveBeenCalledWith(1, pagination);
    });

    it('should throw UnauthorizedException when JWT guard fails', async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [FollowersController],
        providers: [
          {
            provide: FollowersService,
            useValue: mockFollowersService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => false })
        .compile();

      const controller = module.get<FollowersController>(FollowersController);
      mockFollowersService.getFollowers.mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(
        controller.getFollowers('1', { offset: 0, limit: 10 }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw InternalServerErrorException when getFollowers fails', async () => {
      mockFollowersService.getFollowers.mockRejectedValue(
        new InternalServerErrorException('Failed to get followers'),
      );

      await expect(
        controller.getFollowers('1', { offset: 0, limit: 10 }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('follow', () => {
    it('should follow a user', async () => {
      const userId = '1';
      const request = {
        user: { userId: 2 },
      };
      const expectedMessage = 'You are now following 1';
      mockFollowersService.follow.mockResolvedValue(expectedMessage);

      const result = await controller.follow(userId, request);
      expect(result).toBe(expectedMessage);
      expect(service.follow).toHaveBeenCalledWith(2, 1);
    });

    it('should throw UnauthorizedException when JWT guard fails', async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [FollowersController],
        providers: [
          {
            provide: FollowersService,
            useValue: mockFollowersService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => false })
        .compile();

      const controller = module.get<FollowersController>(FollowersController);
      mockFollowersService.follow.mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(
        controller.follow('1', { user: { userId: 2 } }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException when trying to follow yourself', async () => {
      mockFollowersService.follow.mockRejectedValue(
        new BadRequestException('You cannot follow yourself'),
      );

      await expect(
        controller.follow('1', { user: { userId: 1 } }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.follow('1', { user: { userId: 1 } }),
      ).rejects.toThrow('You cannot follow yourself');
    });

    it('should throw InternalServerErrorException when follow fails', async () => {
      mockFollowersService.follow.mockRejectedValue(
        new InternalServerErrorException('Failed to follow user'),
      );

      await expect(
        controller.follow('1', { user: { userId: 2 } }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('unfollow', () => {
    it('should unfollow a user', async () => {
      const userId = '1';
      const request = {
        user: { userId: 2 },
      };
      const expectedMessage = 'You are now unfollowing 1';
      mockFollowersService.unfollow.mockResolvedValue(expectedMessage);

      const result = await controller.unfollow(userId, request);
      expect(result).toBe(expectedMessage);
      expect(service.unfollow).toHaveBeenCalledWith(2, 1);
    });

    it('should throw UnauthorizedException when JWT guard fails', async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [FollowersController],
        providers: [
          {
            provide: FollowersService,
            useValue: mockFollowersService,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => false })
        .compile();

      const controller = module.get<FollowersController>(FollowersController);
      mockFollowersService.unfollow.mockRejectedValue(
        new UnauthorizedException(),
      );

      await expect(
        controller.unfollow('1', { user: { userId: 2 } }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException when follow relationship does not exist', async () => {
      mockFollowersService.unfollow.mockRejectedValue(
        new NotFoundException('Follow not found'),
      );

      await expect(
        controller.unfollow('1', { user: { userId: 2 } }),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.unfollow('1', { user: { userId: 2 } }),
      ).rejects.toThrow('Follow not found');
    });

    it('should throw InternalServerErrorException when unfollow fails', async () => {
      mockFollowersService.unfollow.mockRejectedValue(
        new InternalServerErrorException('Failed to unfollow user'),
      );

      await expect(
        controller.unfollow('1', { user: { userId: 2 } }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
