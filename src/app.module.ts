import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostgreModule } from './core/database/postgre.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/posts/posts.module';
import { FollowersModule } from './modules/followers/followers.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 5000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot(),
    PostgreModule,
    UserModule,
    AuthModule,
    PostsModule,
    FollowersModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
