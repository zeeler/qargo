import { UserRole } from '../constants/enums';

export interface SendCodeDto {
  phone: string;
}

export interface RegisterDto {
  phone: string;
  code: string;
  name: string;
  role: UserRole;
  defaultAddress?: string;
}

export interface LoginDto {
  phone: string;
  code: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  phone: string;
  role: UserRole;
}
