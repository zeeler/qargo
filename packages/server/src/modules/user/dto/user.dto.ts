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
