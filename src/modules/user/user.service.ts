import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { GetUserDto } from './dto/get-user.dto';
import { plainToInstance } from 'class-transformer';
import { comparePassword } from '@/utils/hash-password.util';
import { AuthDto } from '../auth/dto/auth-dto';
import { PaginationDto } from '@/core/dto/pagination.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(user: CreateUserDto): Promise<GetUserDto> {
    try {
      const newUser = this.userRepository.create(user);
      const createdUser = await this.userRepository.save(newUser);
      return plainToInstance(GetUserDto, createdUser, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll({ limit, offset }: PaginationDto): Promise<GetUserDto[]> {
    try {
      const [users] = await this.userRepository.findAndCount({
        select: ['email', 'firstname', 'id', 'lastname'],
        skip: offset,
        take: limit,
      });
      return plainToInstance(GetUserDto, users, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Failed to get users', error);
      throw new InternalServerErrorException('Failed to get users');
    }
  }

  async validateUser({ email, password }: AuthDto): Promise<GetUserDto> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) throw new UnauthorizedException('Invalid credentials');

      if (!(await comparePassword(password, user.password)))
        throw new UnauthorizedException();

      return plainToInstance(GetUserDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      console.error('Failed user validation', error);
      throw new InternalServerErrorException('Failed user validation');
    }
  }

  async findOne(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) throw new NotFoundException('User not found');
      return plainToInstance(GetUserDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Failed to get user', error);
      throw new InternalServerErrorException('Failed to get user');
    }
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
