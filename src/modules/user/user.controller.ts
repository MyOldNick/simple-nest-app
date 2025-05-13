import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { JwtAuthGuard } from '@/core/guards/auth.guard';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaginationDto } from '@/core/dto/pagination.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({
    status: 201,
    description: 'Successful create user',
    type: GetUserDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @Post()
  create(@Body() user: CreateUserDto): Promise<GetUserDto> {
    return this.userService.create(user);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Successful get users',
    type: GetUserDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() pagination: PaginationDto): Promise<GetUserDto[]> {
    return this.userService.findAll(pagination);
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({
    status: 200,
    description: 'Successful get user',
    type: GetUserDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.userService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
