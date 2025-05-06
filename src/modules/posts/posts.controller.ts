import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '@/core/guards/auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostDto } from './dto/get-post.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

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
    getAllPosts(): Promise<GetPostDto[]> {
        return this.postsService.getAllPosts();
    }

    @ApiOperation({ summary: 'Create post' })
    @ApiResponse({
      status: 201,
      description: 'Successful create post',
      type: GetPostDto,
    })
    @ApiResponse({ status: 404, description: 'Invalid data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @UseGuards(JwtAuthGuard)
    @Post()
    createPost(@Body() data: CreatePostDto, @Req() req): Promise<GetPostDto> {
        return this.postsService.createPost({...data, author: req.user.userId});
    }
}
