import { Body, Controller, Post } from '@nestjs/common';
import { AuthDto } from './dto/auth-dto';
import { AuthService } from './auth.service';
import { SuccessLoginDto } from './dto/success-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(@Body() data: AuthDto): Promise<SuccessLoginDto> {
    return this.authService.login(data);
  }
}
