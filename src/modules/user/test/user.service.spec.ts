import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { GetUserDto } from '../dto/get-user.dto';
import {
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AuthDto } from '@/modules/auth/dto/auth-dto';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from '@/core/dto/pagination.dto';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 1,
    firstname: 'John',
    lastname: 'Doe',
    password: 'hashedpassword',
    email: 'test@gmail.com',
    posts: [],
    hashPasswordBeforeInsert: jest.fn(),
  };

  const createUserDto: CreateUserDto = plainToInstance(
    CreateUserDto,
    mockUser,
    {
      excludeExtraneousValues: true,
    },
  );

  const getUserDto: GetUserDto = plainToInstance(GetUserDto, mockUser, {
    excludeExtraneousValues: true,
  });

  const authDto: AuthDto = {
    email: 'test@gmail.com',
    password: 'hashedpassword',
  };

  const mockPaginationDto: PaginationDto = {
    limit: 10,
    offset: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    ) as jest.Mocked<Repository<User>>;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await userService.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(getUserDto);
    });

    it('should throw InternalServerErrorException with correct message when creation fails', async () => {
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(userService.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(userService.create(createUserDto)).rejects.toThrow(
        'Failed to create user',
      );
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users with pagination', async () => {
      userRepository.findAndCount.mockResolvedValue([[mockUser], 1]);

      const result = await userService.findAll(mockPaginationDto);

      expect(userRepository.findAndCount).toHaveBeenCalledWith({
        select: ['email', 'firstname', 'id', 'lastname'],
        skip: mockPaginationDto.offset,
        take: mockPaginationDto.limit,
      });
      expect(result).toEqual([getUserDto]);
    });

    it('should return empty array if no users', async () => {
      userRepository.findAndCount.mockResolvedValue([[], 0]);
      const result = await userService.findAll(mockPaginationDto);
      expect(result).toEqual([]);
      expect(userRepository.findAndCount).toHaveBeenCalledWith({
        select: ['email', 'firstname', 'id', 'lastname'],
        skip: mockPaginationDto.offset,
        take: mockPaginationDto.limit,
      });
    });

    it('should throw InternalServerErrorException with correct message when fetching fails', async () => {
      userRepository.findAndCount.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(userService.findAll(mockPaginationDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(userService.findAll(mockPaginationDto)).rejects.toThrow(
        'Failed to get users',
      );
      expect(userRepository.findAndCount).toHaveBeenCalledWith({
        select: ['email', 'firstname', 'id', 'lastname'],
        skip: mockPaginationDto.offset,
        take: mockPaginationDto.limit,
      });
    });
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      jest
        .spyOn(require('@/utils/hash-password.util'), 'comparePassword')
        .mockResolvedValue(true);

      const result = await userService.validateUser(authDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: authDto.email },
      });
      expect(result).toEqual(getUserDto);
    });

    it('should throw UnauthorizedException with correct message if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(userService.validateUser(authDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(userService.validateUser(authDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: authDto.email },
      });
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      jest
        .spyOn(require('@/utils/hash-password.util'), 'comparePassword')
        .mockResolvedValue(false);

      await expect(userService.validateUser(authDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: authDto.email },
      });
    });

    it('should throw InternalServerErrorException with correct message when validation fails', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(userService.validateUser(authDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(userService.validateUser(authDto)).rejects.toThrow(
        'Failed user validation',
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: authDto.email },
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id successfully', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await userService.findOne(mockUser.id);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(getUserDto);
    });

    it('should throw NotFoundException with correct message if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(userService.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(userService.findOne(999)).rejects.toThrow('User not found');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it('should throw InternalServerErrorException when database error occurs', async () => {
      userRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(userService.findOne(mockUser.id)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });
  });
});
