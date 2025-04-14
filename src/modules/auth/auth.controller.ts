import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from './dto/auth-dto';
import { AuthService } from './auth.service';
import { SuccessLoginDto } from './dto/success-login.dto';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SuccessTokenDto } from './dto/success-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    type: SuccessLoginDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid credentials' })
  @Post()
  async login(@Body() data: AuthDto): Promise<SuccessLoginDto> {
    return this.authService.login(data);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed',
    type: SuccessTokenDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid refresh token' })
  @ApiBody({ schema: { example: { refresh_token: 'validRefreshToken123' } } })
  @Post('refresh')
  async refresh(
    @Body('refresh_token') token: string,
  ): Promise<SuccessTokenDto> {
    return this.authService.refresh(token);
  }
}
