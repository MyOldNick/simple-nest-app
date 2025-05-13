import { User } from '@/modules/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Follows {
  @ApiProperty({ title: 'Id', description: 'follow id', example: '1' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    title: 'Follower',
    description: 'follower user',
    example: '1',
  })
  @ManyToOne(() => User, (user) => user.following, { onDelete: 'CASCADE' })
  follower: User;

  @ApiProperty({
    title: 'Following',
    description: 'following user',
    example: '1',
  })
  @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  following: User;

  @ApiProperty({
    title: 'Created At',
    description: 'follow created at',
    example: '2021-01-01',
  })
  @CreateDateColumn()
  createdAt: Date;
}
