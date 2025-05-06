import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserDto {
  @ApiProperty({ title: 'Id', description: 'user id', example: '12' })
  @IsNumber()
  @Expose()
  id: number;

  @ApiProperty({
    title: 'Email',
    description: 'User email',
    example: 'adolf@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;

  @ApiProperty({
    title: 'Firstname',
    description: 'user firstname',
    example: 'Adolf',
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  firstname: string;

  @ApiProperty({
    title: 'Lastname',
    description: 'user lastname',
    example: 'Painter',
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  lastname: string;
}
