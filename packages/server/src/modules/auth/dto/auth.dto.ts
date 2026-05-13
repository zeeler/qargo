import { IsString, IsNotEmpty, IsPhoneNumber, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@open-trade/shared';

export class SendCodeDto {
  @IsString()
  @IsNotEmpty({ message: '请输入手机号' })
  phone: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: '请输入手机号' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: '请输入验证码' })
  code: string;

  @IsString()
  @IsNotEmpty({ message: '请输入姓名' })
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
  @IsNotEmpty({ message: '请输入手机号' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: '请输入验证码' })
  code: string;
}
