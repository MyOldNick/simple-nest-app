import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthDto } from '../dto/auth-dto';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockAuthDto: AuthDto = {
    email: 'test@gmail.com',
    password: 'password123',
  };

  const mockUser = {
    id: 1,
    email: 'test@gmail.com',
    firstname: 'John',
    lastname: 'Doe',
  };

  const mockAccessToken = 'mockAccessToken';
  const mockRefreshToken = 'mockRefreshToken';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(
      UserService,
    ) as jest.Mocked<UserService>;
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
    configService = module.get<ConfigService>(
      ConfigService,
    ) as jest.Mocked<ConfigService>;
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should return access and refresh tokens on successful login', async () => {
      userService.validateUser.mockResolvedValue(mockUser);
      jwtService.signAsync
        .mockResolvedValueOnce(mockAccessToken)
        .mockResolvedValueOnce(mockRefreshToken);

      const result = await authService.login(mockAuthDto);

      expect(userService.validateUser).toHaveBeenCalledWith(mockAuthDto);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
      });
      expect(result).toEqual({
        access_token: mockAccessToken,
        refresh_token: mockRefreshToken,
      });
    });

    it('should throw UnauthorizedException if user validation fails', async () => {
      userService.validateUser.mockResolvedValue(null);

      await expect(authService.login(mockAuthDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      userService.validateUser.mockRejectedValue(new Error('Unexpected error'));

      await expect(authService.login(mockAuthDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('refresh', () => {
    it('should return a new access token on valid refresh token', async () => {
      const mockPayload = { email: mockUser.email, sub: mockUser.id };
      jwtService.verifyAsync.mockResolvedValue(mockPayload);
      jwtService.signAsync.mockResolvedValue(mockAccessToken);
      configService.get.mockReturnValue('mockSecret');

      const result = await authService.refresh(mockRefreshToken);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'mockSecret',
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockPayload);
      expect(result).toEqual({ access_token: mockAccessToken });
    });

    it('should throw InternalServerErrorException on invalid refresh token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));
      configService.get.mockReturnValue('mockSecret');

      await expect(authService.refresh(mockRefreshToken)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
