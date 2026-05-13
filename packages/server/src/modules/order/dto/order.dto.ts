import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { PaymentMethod } from '@open-trade/shared';

export class CreateOrderDto {
  @IsString()
  vehicleTypeCode: string;

  @IsString()
  pickupAddress: string;

  @IsNumber()
  pickupLng: number;

  @IsNumber()
  pickupLat: number;

  @IsString()
  pickupContactName: string;

  @IsString()
  pickupContactPhone: string;

  @IsString()
  dropoffAddress: string;

  @IsNumber()
  dropoffLng: number;

  @IsNumber()
  dropoffLat: number;

  @IsString()
  dropoffContactName: string;

  @IsString()
  dropoffContactPhone: string;

  @IsOptional()
  @IsNumber()
  userAdditionalFee?: number;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

export class NearbyOrderQueryDto {
  @IsNumber()
  lng: number;

  @IsNumber()
  lat: number;

  @IsOptional()
  @IsNumber()
  radiusKm?: number;
}

export class UploadPhotoDto {
  @IsString()
  photoUrl: string;
}
