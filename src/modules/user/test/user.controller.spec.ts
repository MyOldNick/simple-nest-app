import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { User } from '../entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../dto/create-user.dto';
import { GetUserDto } from '../dto/get-user.dto';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should create a user', async () => {
      (userService.create as jest.Mock).mockReturnValue(
        Promise.resolve(getUserDto),
      );

      const result = await userController.create(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);

      expect(result).toEqual(getUserDto);
    });
  });

  describe('get users', () => {
    it('chould return all users', async () => {
      (userService.findAll as jest.Mock).mockReturnValue(
        Promise.resolve([getUserDto]),
      );

      const result = await userController.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual([getUserDto]);
    });
  });

  it('should throw an error if fetching users fails', async () => {
    (userService.findAll as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch users'),
    );

    await expect(userController.findAll()).rejects.toThrow(
      'Failed to fetch users',
    );
    expect(userService.findAll).toHaveBeenCalled();
  });
});
