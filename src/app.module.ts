import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostgreModule } from './core/database/postgre.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot(), PostgreModule, UserModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
