import { ApiProperty } from '@nestjs/swagger';
import { hashPassword } from '@/utils/hash-password.util';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '@/modules/posts/entities/post.entity';
import { Exclude } from 'class-transformer';
import { Follows } from '@/modules/followers/entity/follows.entity';

@Entity()
export class User {
  @ApiProperty({ title: 'Id', description: 'user id', example: '1' })
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ApiProperty({
    title: 'Firstname',
    description: 'user firstname',
    example: 'Adolf',
  })
  @Column({ type: 'varchar' })
  firstname: string;

  @ApiProperty({
    title: 'Lastname',
    description: 'user lastname',
    example: 'Painter',
  })
  @Column({ type: 'varchar' })
  lastname: string;

  @ApiProperty({
    title: 'Password',
    description: 'user password',
    example: 'StrOngPassWordd&&1F',
  })
  @Column({ type: 'varchar' })
  @Exclude()
  password: string;

  @ApiProperty({
    title: 'Email',
    description: 'User email',
    example: 'adolf@gmail.com',
  })
  @Column({ type: 'varchar', unique: true })
  email: string;

  @ApiProperty({
    title: 'Followers',
    description: 'user followers',
    example: '1',
  })
  @OneToMany(() => Follows, (follow) => follow.following)
  followers?: Array<Follows>;

  @ApiProperty({
    title: 'Following',
    description: 'user following',
    example: '1',
  })
  @OneToMany(() => Follows, (follow) => follow.follower)
  following?: Array<Follows>;

  @ApiProperty({
    title: 'Posts',
    description: "user's posts",
    example: "['post1', 'post2']",
  })
  @OneToMany(() => Post, (post) => post.author)
  @JoinColumn()
  posts?: Array<Post>;

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    this.password = await hashPassword(this.password);
  }
}
