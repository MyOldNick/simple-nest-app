import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({ title: 'Limit', description: 'limit', example: 'limit: 10' })
  @Expose()
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    title: 'Offset',
    description: 'offset',
    example: 'offset: 10',
  })
  @Expose()
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  offset?: number;
}
