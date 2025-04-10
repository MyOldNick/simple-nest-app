import { ApiProperty } from '@nestjs/swagger';
import { hashPassword } from 'src/utils/hash-password.util';
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @ApiProperty({ title: 'Id', description: 'user id', example: '1' })
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ApiProperty({
    title: 'Firstname',
    description: 'user firstname',
    example: 'Adolf',
  })
  @Column({ type: 'varchar' })
  firstname: string;

  @ApiProperty({
    title: 'Lastname',
    description: 'user lastname',
    example: 'Painter',
  })
  @Column({ type: 'varchar' })
  lastname: string;

  @ApiProperty({
    title: 'Password',
    description: 'user password',
    example: 'StrOngPassWordd&&1F',
  })
  @Column({ type: 'varchar' })
  password: string;

  @ApiProperty({
    title: 'Email',
    description: 'User email',
    example: 'adolf@gmail.com',
  })
  @Column({ type: 'varchar', unique: true })
  email: string;

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    this.password = await hashPassword(this.password);
  }
}
