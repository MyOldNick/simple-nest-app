import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class SuccessLoginDto {
  @ApiProperty({
    title: 'Access token',
    description: 'access token',
    example: 'lsakdjf23gklsdjflksdf',
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  access_token: string;

  @ApiProperty({
    title: 'Refresh token',
    description: 'refresh token',
    example: 'lsakdjf23gklsdjflksdf',
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  refresh_token: string;
}
