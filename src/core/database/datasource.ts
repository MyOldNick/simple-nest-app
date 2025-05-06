// data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '@/modules/user/entities/user.entity';
import { Post } from '@/modules/posts/entities/post.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT!,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User, Post],
  synchronize: false,
  migrations: ['dist/src/core/database/migrations/*.js'],
});
