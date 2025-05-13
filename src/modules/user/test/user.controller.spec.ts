import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { User } from '../entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../dto/create-user.dto';
import { GetUserDto } from '../dto/get-user.dto';
import { PaginationDto } from '@/core/dto/pagination.dto';
import { InternalServerErrorException } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

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

  const getUserDto = plainToInstance(GetUserDto, mockUser, {
    excludeExtraneousValues: true,
  });

  const mockPaginationDto: PaginationDto = {
    limit: 10,
    offset: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      (userService.create as jest.Mock).mockResolvedValue(getUserDto);

      const result = await userController.create(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(getUserDto);
    });

    it('should throw error when user creation fails', async () => {
      (userService.create as jest.Mock).mockRejectedValue(
        new InternalServerErrorException('Failed to create user'),
      );

      await expect(userController.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return all users with pagination', async () => {
      (userService.findAll as jest.Mock).mockResolvedValue([getUserDto]);

      const result = await userController.findAll(mockPaginationDto);

      expect(userService.findAll).toHaveBeenCalledWith(mockPaginationDto);
      expect(result).toEqual([getUserDto]);
    });

    it('should return empty array when no users exist', async () => {
      (userService.findAll as jest.Mock).mockResolvedValue([]);

      const result = await userController.findAll(mockPaginationDto);

      expect(userService.findAll).toHaveBeenCalledWith(mockPaginationDto);
      expect(result).toEqual([]);
    });

    it('should throw error when fetching users fails', async () => {
      (userService.findAll as jest.Mock).mockRejectedValue(
        new InternalServerErrorException('Failed to get users'),
      );

      await expect(userController.findAll(mockPaginationDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(userService.findAll).toHaveBeenCalledWith(mockPaginationDto);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const expectedResult = `This action returns a #${mockUser.id} user`;
      (userService.findOne as jest.Mock).mockResolvedValue(expectedResult);

      const result = await userController.findOne(mockUser.id.toString());

      expect(userService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(result).toBe(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const expectedResult = `This action updates a #${mockUser.id} user`;
      (userService.update as jest.Mock).mockResolvedValue(expectedResult);

      const result = await userController.update(mockUser.id.toString());

      expect(userService.update).toHaveBeenCalledWith(mockUser.id);
      expect(result).toBe(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const expectedResult = `This action removes a #${mockUser.id} user`;
      (userService.remove as jest.Mock).mockResolvedValue(expectedResult);

      const result = await userController.remove(mockUser.id.toString());

      expect(userService.remove).toHaveBeenCalledWith(mockUser.id);
      expect(result).toBe(expectedResult);
    });
  });
});
