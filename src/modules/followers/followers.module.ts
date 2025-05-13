import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '@/core/strategies/jwt.strategy';
import { FollowersService } from './followers.service';
import { FollowersController } from './followers.controller';
import { Follows } from './entity/follows.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Follows]), JwtModule, ConfigModule],
  controllers: [FollowersController],
  providers: [FollowersService, JwtStrategy],
  exports: [],
})
export class FollowersModule {}
