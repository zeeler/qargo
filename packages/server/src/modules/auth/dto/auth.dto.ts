import { IsString, IsNotEmpty, IsOptional, IsEnum, Matches } from 'class-validator';
import { UserRole } from '@open-trade/shared';

const PHONE_REGEX = /^1[3-9]\d{9}$/;
const PHONE_MESSAGE = '请输入正确的手机号';

export class SendCodeDto {
  @IsString()
  @IsNotEmpty({ message: '请输入手机号' })
  @Matches(PHONE_REGEX, { message: PHONE_MESSAGE })
  phone: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: '请输入手机号' })
  @Matches(PHONE_REGEX, { message: PHONE_MESSAGE })
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
  @Matches(PHONE_REGEX, { message: PHONE_MESSAGE })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: '请输入验证码' })
  code: string;
}
