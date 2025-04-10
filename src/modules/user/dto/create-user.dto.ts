import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
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

  @ApiProperty({
    title: 'Password',
    description: 'user password',
    example: 'StrOngPassWordd&&1F',
  })
  @IsNotEmpty()
  @IsString()
  @Expose()
  password: string;
}
