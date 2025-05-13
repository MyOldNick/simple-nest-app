import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthDto } from './dto/auth-dto';
import { SuccessLoginDto } from './dto/success-login.dto';
import { ConfigService } from '@nestjs/config';
import { SuccessTokenDto } from './dto/success-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(data: AuthDto): Promise<SuccessLoginDto> {
    try {
      const user = await this.userService.validateUser(data);
      if (!user) throw new UnauthorizedException('Invalid credentials');
      const payload = { email: user.email, sub: user.id };
      return {
        access_token: await this.jwtService.signAsync(payload),
        refresh_token: await this.jwtService.signAsync(payload, {
          expiresIn: '7d',
        }),
      };
    } catch (error) {
      if (error instanceof HttpException || error instanceof UnauthorizedException) throw error;
      console.error(error);
      throw new InternalServerErrorException('Login failed');
    }
  }

  async refresh(token: string): Promise<SuccessTokenDto> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      return {
        access_token: await this.jwtService.signAsync({
          email: payload.email,
          sub: payload.sub,
        }),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error(error);
      throw new InternalServerErrorException('Token refresh failed');
    }
  }
}
