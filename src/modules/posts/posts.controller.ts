import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '@/core/guards/auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostDto } from './dto/get-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

    @UseGuards(JwtAuthGuard) 
    @Get()
    getAllPosts(): Promise<GetPostDto[]> {
        return this.postsService.getAllPosts();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    createPost(@Body() data: CreatePostDto, @Req() req): Promise<GetPostDto> {
        return this.postsService.createPost({...data, author: req.user.userId});
    }
}
