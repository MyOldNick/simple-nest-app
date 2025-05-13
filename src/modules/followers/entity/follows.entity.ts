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

  @ManyToOne(() => User, (user: User) => user.following, {
    onDelete: 'CASCADE',
  })
  follower: User;

  @ManyToOne(() => User, (user: User) => user.followers, {
    onDelete: 'CASCADE',
  })
  following: User;

  @ApiProperty({
    title: 'Created At',
    description: 'follow created at',
    example: '2021-01-01',
  })
  @CreateDateColumn()
  createdAt: Date;
}
