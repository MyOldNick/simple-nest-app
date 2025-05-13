import { Test, TestingModule } from '@nestjs/testing';
import { FollowersService } from '../followers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Follows } from '../entity/follows.entity';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from '@/core/dto/pagination.dto';
import { GetFollowersDto } from '../dto/get-followers.dto';
import { GetUserDto } from '@/modules/user/dto/get-user.dto';

describe('FollowersService', () => {
  let service: FollowersService;
  let repository: Repository<Follows>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowersService,
        {
          provide: getRepositoryToken(Follows),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FollowersService>(FollowersService);
    repository = module.get<Repository<Follows>>(getRepositoryToken(Follows));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('follow', () => {
    it('should create a follow relationship', async () => {
      const followerId = 1;
      const followingId = 2;
      const mockFollow = {
        follower: { id: followerId },
        following: { id: followingId },
      };
      mockRepository.create.mockReturnValue(mockFollow);
      mockRepository.save.mockResolvedValue(mockFollow);

      const result = await service.follow(followingId, followerId);
      expect(result).toBe(`You are now following ${followingId}`);
      expect(repository.create).toHaveBeenCalledWith({
        follower: { id: followerId },
        following: { id: followingId },
      });
      expect(repository.save).toHaveBeenCalledWith(mockFollow);
    });

    it('should throw BadRequestException when trying to follow yourself', async () => {
      const userId = 1;
      await expect(service.follow(userId, userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.follow(userId, userId)).rejects.toThrow(
        'You cannot follow yourself',
      );
    });

    it('should throw InternalServerErrorException when follow fails', async () => {
      const followerId = 1;
      const followingId = 2;
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.follow(followingId, followerId)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.follow(followingId, followerId)).rejects.toThrow(
        'Failed to follow user',
      );
    });
  });

  describe('unfollow', () => {
    it('should remove a follow relationship', async () => {
      const followerId = 1;
      const followingId = 2;
      const mockFollow = {
        follower: { id: followerId },
        following: { id: followingId },
      };
      mockRepository.findOne.mockResolvedValue(mockFollow);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.unfollow(followerId, followingId);
      expect(result).toBe(`You are now unfollowing ${followingId}`);
      expect(repository.delete).toHaveBeenCalledWith({
        follower: { id: followerId },
        following: { id: followingId },
      });
    });

    it('should throw NotFoundException when follow relationship does not exist', async () => {
      const followerId = 1;
      const followingId = 2;
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.unfollow(followerId, followingId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.unfollow(followerId, followingId)).rejects.toThrow(
        'Follow not found',
      );
    });

    it('should throw InternalServerErrorException when unfollow fails', async () => {
      const followerId = 1;
      const followingId = 2;
      mockRepository.findOne.mockResolvedValue({
        follower: { id: followerId },
        following: { id: followingId },
      });
      mockRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.unfollow(followingId, followerId)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.unfollow(followingId, followerId)).rejects.toThrow(
        'Failed to unfollow user',
      );
    });
  });

  describe('countFollowers', () => {
    it('should return the number of followers', async () => {
      const userId = 1;
      const expectedCount = 5;
      mockRepository.count.mockResolvedValue(expectedCount);

      const result = await service.countFollowers(userId);
      expect(result).toBe(expectedCount);
      expect(repository.count).toHaveBeenCalledWith({
        where: { following: { id: userId } },
      });
    });

    it('should throw InternalServerErrorException when count fails', async () => {
      const userId = 1;
      mockRepository.count.mockRejectedValue(new Error('Database error'));

      await expect(service.countFollowers(userId)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.countFollowers(userId)).rejects.toThrow(
        'Failed to count followers',
      );
    });
  });

  describe('getFollowers', () => {
    it('should return a list of followers with pagination', async () => {
      const userId = 1;
      const pagination: PaginationDto = { offset: 0, limit: 10 };
      const mockFollowers: GetFollowersDto[] = [
        {
          follower: { id: 2 } as GetUserDto,
          createdAt: new Date(),
        },
        {
          follower: { id: 3 } as GetUserDto,
          createdAt: new Date(),
        },
      ];
      mockRepository.find.mockResolvedValue(mockFollowers);

      const result = await service.getFollowers(userId, pagination);
      expect(result).toEqual(mockFollowers);
      expect(repository.find).toHaveBeenCalledWith({
        where: { following: { id: userId } },
        relations: ['follower'],
        skip: pagination.offset,
        take: pagination.limit,
        order: { createdAt: 'DESC' },
      });
    });

    it('should throw InternalServerErrorException when getFollowers fails', async () => {
      const userId = 1;
      const pagination: PaginationDto = { offset: 0, limit: 10 };
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.getFollowers(userId, pagination)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.getFollowers(userId, pagination)).rejects.toThrow(
        'Failed to get followers',
      );
    });
  });
});
