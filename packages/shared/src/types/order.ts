import { OrderStatus, PaymentMethod } from '../constants/enums';

export interface PriceQuery {
  vehicleTypeCode: string;
  pickupLng: number;
  pickupLat: number;
  dropoffLng: number;
  dropoffLat: number;
}

export interface PriceResult {
  distanceKm: number;
  basePrice: number;
  distancePrice: number;
  surgeFee: number;
  totalPrice: number;
}

export interface CreateOrderDto {
  vehicleTypeCode: string;
  pickupAddress: string;
  pickupLng: number;
  pickupLat: number;
  pickupContactName: string;
  pickupContactPhone: string;
  dropoffAddress: string;
  dropoffLng: number;
  dropoffLat: number;
  dropoffContactName: string;
  dropoffContactPhone: string;
  userAdditionalFee?: number;
  remark?: string;
  paymentMethod: PaymentMethod;
}

export interface OrderVo {
  id: string;
  orderNo: string;
  status: OrderStatus;
  vehicleTypeName: string;
  vehicleTypeCode: string;
  pickupAddress: string;
  dropoffAddress: string;
  distanceKm: number;
  totalPrice: number;
  userAdditionalFee: number;
  basePrice: number;
  distancePrice: number;
  surgeFee: number;
  paymentMethod: PaymentMethod;
  cargoPhotos: string[];
  remark: string;
  driverName?: string;
  driverPhone?: string;
  driverAvatar?: string;
  driverPlateNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NearbyOrderQuery {
  lng: number;
  lat: number;
  radiusKm?: number;
}

export interface DispatchOrderDto {
  orderId: string;
}
