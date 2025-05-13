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
  const mockJwtSecret = 'mockSecret';

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
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;

    // Reset all mocks before each test
    jest.clearAllMocks();
    configService.get.mockReturnValue(mockJwtSecret);
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
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, {
        email: mockUser.email,
        sub: mockUser.id,
      });
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(2, {
        email: mockUser.email,
        sub: mockUser.id,
      }, {
        expiresIn: '7d',
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
      expect(userService.validateUser).toHaveBeenCalledWith(mockAuthDto);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      userService.validateUser.mockRejectedValue(new Error('Unexpected error'));

      await expect(authService.login(mockAuthDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(userService.validateUser).toHaveBeenCalledWith(mockAuthDto);
    });

    it('should throw InternalServerErrorException if token generation fails', async () => {
      userService.validateUser.mockResolvedValue(mockUser);
      jwtService.signAsync.mockRejectedValue(new Error('Token generation failed'));

      await expect(authService.login(mockAuthDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('refresh', () => {
    const mockPayload = { email: mockUser.email, sub: mockUser.id };

    it('should return a new access token on valid refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue(mockPayload);
      jwtService.signAsync.mockResolvedValue(mockAccessToken);

      const result = await authService.refresh(mockRefreshToken);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockRefreshToken, {
        secret: mockJwtSecret,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(mockPayload);
      expect(result).toEqual({ access_token: mockAccessToken });
    });

    it('should throw InternalServerErrorException on invalid refresh token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(authService.refresh(mockRefreshToken)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockRefreshToken, {
        secret: mockJwtSecret,
      });
    });

    it('should throw InternalServerErrorException if new token generation fails', async () => {
      jwtService.verifyAsync.mockResolvedValue(mockPayload);
      jwtService.signAsync.mockRejectedValue(new Error('Token generation failed'));

      await expect(authService.refresh(mockRefreshToken)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if JWT secret is not configured', async () => {
      configService.get.mockReturnValue(undefined);

      await expect(authService.refresh(mockRefreshToken)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
