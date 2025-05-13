import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostgreModule } from './core/database/postgre.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/posts/posts.module';
import { FollowersModule } from './modules/followers/followers.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PostgreModule,
    UserModule,
    AuthModule,
    PostsModule,
    FollowersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
