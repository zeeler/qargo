import { IsString, IsNumber, IsOptional } from 'class-validator';

export class PriceQueryDto {
  @IsString()
  vehicleTypeCode: string;

  @IsNumber()
  pickupLng: number;

  @IsNumber()
  pickupLat: number;

  @IsNumber()
  dropoffLng: number;

  @IsNumber()
  dropoffLat: number;

  @IsOptional()
  @IsNumber()
  userAdditionalFee?: number;
}
