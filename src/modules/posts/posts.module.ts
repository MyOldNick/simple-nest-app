import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { JwtStrategy } from '@/core/strategies/jwt.strategy';
import { Post } from './entities/post.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User]), JwtModule, ConfigModule],
  controllers: [PostsController],
  providers: [PostsService, JwtStrategy],
  exports: [PostsService],
})
export class PostsModule {}
