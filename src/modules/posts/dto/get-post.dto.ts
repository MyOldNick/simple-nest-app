import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';
import { IsDate, IsNotEmpty } from 'class-validator';
import { GetUserDto } from '@/modules/user/dto/get-user.dto';
import { Expose, Type } from 'class-transformer';

export class GetPostDto extends OmitType(CreatePostDto, ['author'] as const) {
  @ApiProperty({ title: 'Id', description: 'post id', example: '1' })
  @Expose()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    title: 'Author',
    description: 'Author of post',
    type: () => GetUserDto,
  })
  @IsNotEmpty()
  @Type(() => GetUserDto)
  @Expose()
  author: GetUserDto;

  @ApiProperty({
    title: 'Created at',
    description: 'Post created at',
    example: '2021-01-01',
  })
  @IsDate()
  @Expose()
  createdAt: Date;
}
