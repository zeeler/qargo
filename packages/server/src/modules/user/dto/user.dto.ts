import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  defaultAddress?: string;
}

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsString()
  address: string;

  @IsNumber()
  lng: number;

  @IsNumber()
  lat: number;

  @IsString()
  contactName: string;

  @IsString()
  contactPhone: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
