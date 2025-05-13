import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';

@Entity()
export class Post {
  @ApiProperty({ title: 'Id', description: 'post id', example: '1' })
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ApiProperty({
    title: 'Title',
    description: 'post title',
    example: 'Adolf',
  })
  @Column({ type: 'varchar' })
  title: string;

  @ApiProperty({
    title: 'Content',
    description: 'post content',
    example: 'Adolf',
  })
  @Column({ type: 'varchar' })
  content: string;

  @ApiProperty({
    title: 'Created at',
    description: 'Post created at',
    example: '2021-01-01',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn()
  author: User;
}
