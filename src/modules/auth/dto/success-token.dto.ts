import { OmitType } from '@nestjs/swagger';
import { SuccessLoginDto } from './success-login.dto';

export class SuccessTokenDto extends OmitType(SuccessLoginDto, [
  'refresh_token',
] as const) {}
