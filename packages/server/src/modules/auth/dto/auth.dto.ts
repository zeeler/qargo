import { IsString, IsPhoneNumber, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@open-trade/shared';

export class SendCodeDto {
  @IsString()
  phone: string;
}

export class RegisterDto {
  @IsString()
  phone: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  defaultAddress?: string;
}

export class LoginDto {
  @IsString()
  phone: string;

  @IsString()
  code: string;
}
