import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '@/core/guards/auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostDto } from './dto/get-post.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeletePostDto } from './dto/delete-post.dto';
import { PaginationDto } from '@/core/dto/pagination.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({
    status: 201,
    description: 'Post found',
    type: GetPostDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllPosts(@Query() pagination: PaginationDto): Promise<GetPostDto[]> {
    return this.postsService.getAllPosts(pagination);
  }

  @ApiOperation({ summary: 'Create post' })
  @ApiResponse({
    status: 201,
    description: 'Successful create post',
    type: GetPostDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Post()
  createPost(@Body() data: CreatePostDto, @Req() req): Promise<GetPostDto> {
    return this.postsService.createPost({ ...data, author: req.user.userId });
  }

  @ApiOperation({ summary: 'Delete post' })
  @ApiResponse({ status: 200, description: 'Post deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @UseGuards(JwtAuthGuard)
  @Delete()
  async deletePost(@Body() data: DeletePostDto, @Req() req): Promise<string> {
    return this.postsService.deletePost(data, req.user.userId);
  }
}
