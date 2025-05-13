import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class DeletePostDto {
  @ApiProperty({ title: 'Id', description: 'post id', example: '1' })
  @Expose()
  @IsNotEmpty()
  id: number;
}
