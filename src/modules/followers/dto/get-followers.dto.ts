import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty } from 'class-validator';
import { GetUserDto } from '@/modules/user/dto/get-user.dto';
import { Expose, Type } from 'class-transformer';

export class GetFollowersDto {
  @ApiProperty({
    title: 'Follower',
    description: 'follower user',
    example: '1',
  })
  @IsNotEmpty()
  @Type(() => GetUserDto)
  @Expose()
  follower: GetUserDto;

  @ApiProperty({
    title: 'Created at',
    description: 'follow created at',
    example: '2021-01-01',
  })
  @IsDate()
  @Expose()
  createdAt: Date;
}
