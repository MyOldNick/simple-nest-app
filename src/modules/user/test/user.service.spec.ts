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
} from '@nestjs/common';
import { AuthDto } from '@/modules/auth/dto/auth-dto';
import { plainToInstance } from 'class-transformer';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    ) as jest.Mocked<Repository<User>>;
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await userService.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(getUserDto);
    });

    it('should throw an error', async () => {
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockRejectedValue(new Error('Error saving user'));

      await expect(userService.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('Find all users', () => {
    it('should return all users', async () => {
      userRepository.find.mockResolvedValue([mockUser]);

      const result = await userService.findAll();

      expect(userRepository.find).toHaveBeenCalledWith({
        select: ['email', 'firstname', 'id', 'lastname'],
      });

      expect(result).toEqual([getUserDto]);
    });

    it('should throw an error', async () => {
      userRepository.find.mockRejectedValue(new Error('Failed get users'));

      await expect(userService.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validateUser', () => {
    it('should validate user', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      jest
        .spyOn(require('@/utils/hash-password.util'), 'comparePassword')
        .mockResolvedValue(true);

      const result = await userService.validateUser(authDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: authDto.email },
      });

      const expectedUser = plainToInstance(GetUserDto, mockUser, {
        excludeExtraneousValues: true,
      });

      expect(result).toEqual(expectedUser);
    });

    it('should throw an error if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(userService.validateUser(authDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it("should throw an error if password doesn't match", async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      jest
        .spyOn(require('@/utils/hash-password.util'), 'comparePassword')
        .mockResolvedValue(false);

      await expect(userService.validateUser(authDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw an error if database error', () => {
      userRepository.findOne.mockRejectedValue(new Error('Database error'));

      expect(userService.validateUser(authDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
