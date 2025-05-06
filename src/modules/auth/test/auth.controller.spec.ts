import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { AuthDto } from '../dto/auth-dto';
import { SuccessLoginDto } from '../dto/success-login.dto';
import { SuccessTokenDto } from '../dto/success-token.dto';
import { UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: jest.Mocked<AuthService>;

    const mockAuthDto: AuthDto = {
        email: 'test@gmail.com',
        password: 'password123',
    };

    const mockSuccessLoginDto: SuccessLoginDto = {
        access_token: 'mockAccessToken',
        refresh_token: 'mockRefreshToken',
    };

    const mockSuccessTokenDto: SuccessTokenDto = {
        access_token: 'mockAccessToken',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        login: jest.fn(),
                        refresh: jest.fn(),
                    },
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService) as jest.Mocked<AuthService>;
    });

    it('should be defined', () => {
        expect(authController).toBeDefined();
    });

    describe('login', () => {
        it('should return access and refresh tokens on successful login', async () => {
            authService.login.mockResolvedValue(mockSuccessLoginDto);

            const result = await authController.login(mockAuthDto);

            expect(authService.login).toHaveBeenCalledWith(mockAuthDto);
            expect(result).toEqual(mockSuccessLoginDto);
        });

        it('should throw UnauthorizedException if login fails', async () => {
            authService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

            await expect(authController.login(mockAuthDto)).rejects.toThrow(UnauthorizedException);
            expect(authService.login).toHaveBeenCalledWith(mockAuthDto);
        });

        it('should throw InternalServerErrorException on unexpected error', async () => {
            authService.login.mockRejectedValue(new InternalServerErrorException('Login failed'));

            await expect(authController.login(mockAuthDto)).rejects.toThrow(InternalServerErrorException);
            expect(authService.login).toHaveBeenCalledWith(mockAuthDto);
        });
    });

    describe('refresh', () => {
        const mockRefreshToken = 'mockRefreshToken';

        it('should return a new access token on valid refresh token', async () => {
            authService.refresh.mockResolvedValue(mockSuccessTokenDto);

            const result = await authController.refresh(mockRefreshToken);

            expect(authService.refresh).toHaveBeenCalledWith(mockRefreshToken);
            expect(result).toEqual(mockSuccessTokenDto);
        });

        it('should throw UnauthorizedException if refresh token is invalid', async () => {
            authService.refresh.mockRejectedValue(new UnauthorizedException('Invalid refresh token'));

            await expect(authController.refresh(mockRefreshToken)).rejects.toThrow(UnauthorizedException);
            expect(authService.refresh).toHaveBeenCalledWith(mockRefreshToken);
        });

        it('should throw InternalServerErrorException on unexpected error', async () => {
            authService.refresh.mockRejectedValue(new InternalServerErrorException('Token refresh failed'));

            await expect(authController.refresh(mockRefreshToken)).rejects.toThrow(InternalServerErrorException);
            expect(authService.refresh).toHaveBeenCalledWith(mockRefreshToken);
        });
    });
});