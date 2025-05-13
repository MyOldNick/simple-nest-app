import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    title: 'Title',
    description: 'Post title',
    example: 'My first post',
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  title: string;

  @ApiProperty({
    title: 'Content',
    description: 'Post content',
    example: 'This is the content of my first post',
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  content: string;

  @ApiProperty({
    title: 'Author',
    description: 'Author id',
    example: '12321',
  })
  @IsNumber()
  @Expose()
  author?: number;
}
