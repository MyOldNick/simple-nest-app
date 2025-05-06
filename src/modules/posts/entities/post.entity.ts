import { ApiProperty } from '@nestjs/swagger';
import {  Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

    @ManyToOne(() => User, (user) => user.posts)
    @JoinColumn()
    author: User;
    
}
