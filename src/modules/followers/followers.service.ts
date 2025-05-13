import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follows } from './entity/follows.entity';
import { GetFollowersDto } from './dto/get-followers.dto';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from '@/core/dto/pagination.dto';

@Injectable()
export class FollowersService {
  constructor(
    @InjectRepository(Follows)
    private readonly followsRepository: Repository<Follows>,
  ) {}

  async follow(userId: number, followerId: number): Promise<string> {
    if (userId === followerId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    try {
      const follow = await this.followsRepository.create({
        follower: { id: followerId },
        following: { id: userId },
      });

      await this.followsRepository.save(follow);

      return `You are now following ${userId}`;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to follow user');
    }
  }

  async unfollow(followerId: number, followingId: number): Promise<string> {
    try {
      const result = await this.followsRepository.delete({
        follower: { id: followerId },
        following: { id: followingId },
      });

      if (result.affected === 0) {
        throw new NotFoundException('Follow not found');
      }

      return `You are now unfollowing ${followingId}`;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to unfollow user');
    }
  }

  async countFollowers(userId: number): Promise<number> {
    try {
      return await this.followsRepository.count({
        where: { following: { id: userId } },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to count followers');
    }
  }

  async getFollowers(
    userId: number,
    { offset, limit }: PaginationDto,
  ): Promise<Array<GetFollowersDto>> {
    try {
      const result = await this.followsRepository.find({
        where: { following: { id: userId } },
        relations: ['follower'],
        skip: offset,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });
      return plainToInstance(GetFollowersDto, result, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to get followers');
    }
  }
}
