import { IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class VehicleDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsString()
  color: string;

  @IsString()
  plateNumber: string;

  @IsString()
  vehicleTypeCode: string;

  @IsNumber()
  length: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsString()
  vin: string;
}

export class DriverRegisterDto {
  @IsString()
  realName: string;

  @IsString()
  idCard: string;

  @IsString()
  licenseInfo: string;

  @ValidateNested()
  @Type(() => VehicleDto)
  vehicle: VehicleDto;
}

export class UpdateLocationDto {
  @IsNumber()
  lng: number;

  @IsNumber()
  lat: number;
}
