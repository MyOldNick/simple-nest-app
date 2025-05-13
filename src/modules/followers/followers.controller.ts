import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FollowersService } from './followers.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/core/guards/auth.guard';
import { Follows } from './entity/follows.entity';
import { GetFollowersDto } from './dto/get-followers.dto';
import { PaginationDto } from '@/core/dto/pagination.dto';

@Controller('followers')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @ApiOperation({ summary: 'Count followers' })
  @ApiResponse({
    status: 200,
    description: 'Successful count followers',
    type: Number,
  })
  @Get('count/:id')
  async countFollowers(@Param('id') id: string): Promise<number> {
    return this.followersService.countFollowers(+id);
  }

  @ApiOperation({ summary: 'Get followers' })
  @ApiResponse({
    status: 200,
    description: 'Successful get followers',
    type: [Follows],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UseGuards(JwtAuthGuard)
  @Get('list/:id')
  async getFollowers(
    @Param('id') id: string,
    @Query() pagination: PaginationDto,
  ): Promise<Array<GetFollowersDto>> {
    return this.followersService.getFollowers(+id, pagination);
  }

  @ApiOperation({ summary: 'Follow user' })
  @ApiResponse({
    status: 201,
    description: 'Successful follow user',
    type: String,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UseGuards(JwtAuthGuard)
  @Post('follow/:id')
  async follow(@Param('id') id: string, @Req() request): Promise<string> {
    return this.followersService.follow(+request.user.userId, +id);
  }

  @ApiOperation({ summary: 'Unfollow user' })
  @ApiResponse({
    status: 200,
    description: 'Successful unfollow user',
    type: String,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UseGuards(JwtAuthGuard)
  @Delete('unfollow/:id')
  async unfollow(@Param('id') id: string, @Req() request): Promise<string> {
    return this.followersService.unfollow(+request.user.userId, +id);
  }
}
