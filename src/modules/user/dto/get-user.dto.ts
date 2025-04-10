import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNumber } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserDto extends OmitType(CreateUserDto, ['password'] as const) {
  @ApiProperty({ title: 'Id', description: 'user id', example: '12' })
  @IsNumber()
  @Expose()
  id: number;
}
