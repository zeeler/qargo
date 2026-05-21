import { IsString, IsNumber, IsOptional, IsEnum, Matches } from 'class-validator';
import { PaymentMethod } from '@open-trade/shared';

const PHONE_REGEX = /^1[3-9]\d{9}$/;
const PHONE_MESSAGE = '请输入正确的手机号';

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
  @Matches(PHONE_REGEX, { message: PHONE_MESSAGE })
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
  @Matches(PHONE_REGEX, { message: PHONE_MESSAGE })
  dropoffContactPhone: string;

  @IsOptional()
  @IsNumber()
  userAdditionalFee?: number;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

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
