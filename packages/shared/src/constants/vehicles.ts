import { PaymentMethod } from '../constants/enums';

/**
 * 车型配置
 */
export const VEHICLE_TYPES: VehicleTypeDef[] = [
  { name: '微货', code: 'mini_truck', icon: '🚐', sort: 1, length: 1.7, width: 1.3, height: 1.1, loadCapacity: 0.5, volume: 2.4 },
  { name: '小平板', code: 'small_flatbed', icon: '🛻', sort: 2, length: 2.5, width: 1.5, height: 0.3, loadCapacity: 1.0, volume: 1.1 },
  { name: '小厢货', code: 'small_van', icon: '🚐', sort: 3, length: 2.5, width: 1.5, height: 1.5, loadCapacity: 1.2, volume: 5.6 },
  { name: '3米8', code: 'm3_8', icon: '🚛', sort: 4, length: 3.8, width: 1.9, height: 1.8, loadCapacity: 2.0, volume: 13.0 },
  { name: '中货', code: 'medium_truck', icon: '🚛', sort: 5, length: 4.2, width: 2.1, height: 2.1, loadCapacity: 3.0, volume: 18.5 },
  { name: '5米2', code: 'm5_2', icon: '🚛', sort: 6, length: 5.2, width: 2.2, height: 2.2, loadCapacity: 5.0, volume: 25.2 },
  { name: '6米2', code: 'm6_2', icon: '🚛', sort: 7, length: 6.2, width: 2.3, height: 2.3, loadCapacity: 8.0, volume: 32.8 },
  { name: '6米8', code: 'm6_8', icon: '🚛', sort: 8, length: 6.8, width: 2.4, height: 2.4, loadCapacity: 10.0, volume: 39.2 },
  { name: '7米6', code: 'm7_6', icon: '🚛', sort: 9, length: 7.6, width: 2.4, height: 2.4, loadCapacity: 12.0, volume: 43.8 },
  { name: '8米2', code: 'm8_2', icon: '🚛', sort: 10, length: 8.2, width: 2.4, height: 2.4, loadCapacity: 14.0, volume: 47.2 },
  { name: '8米6', code: 'm8_6', icon: '🚛', sort: 11, length: 8.6, width: 2.4, height: 2.4, loadCapacity: 15.0, volume: 49.5 },
  { name: '9米6', code: 'm9_6', icon: '🚛', sort: 12, length: 9.6, width: 2.4, height: 2.5, loadCapacity: 18.0, volume: 57.6 },
  { name: '11米7', code: 'm11_7', icon: '🚛', sort: 13, length: 11.7, width: 2.5, height: 2.5, loadCapacity: 25.0, volume: 73.1 },
  { name: '12米5', code: 'm12_5', icon: '🚛', sort: 14, length: 12.5, width: 2.5, height: 2.5, loadCapacity: 28.0, volume: 78.1 },
  { name: '13米', code: 'm13', icon: '🚛', sort: 15, length: 13.0, width: 2.5, height: 2.5, loadCapacity: 30.0, volume: 81.3 },
  { name: '13米7', code: 'm13_7', icon: '🚛', sort: 16, length: 13.7, width: 2.5, height: 2.5, loadCapacity: 32.0, volume: 85.6 },
  { name: '15米', code: 'm15', icon: '🚛', sort: 17, length: 15.0, width: 2.5, height: 2.5, loadCapacity: 35.0, volume: 93.8 },
  { name: '16米', code: 'm16', icon: '🚛', sort: 18, length: 16.0, width: 2.8, height: 2.8, loadCapacity: 38.0, volume: 125.4 },
  { name: '17米5', code: 'm17_5', icon: '🚛', sort: 19, length: 17.5, width: 2.8, height: 2.8, loadCapacity: 40.0, volume: 137.2 },
  { name: '冷藏车', code: 'reefer', icon: '❄️', sort: 20, length: 9.6, width: 2.4, height: 2.5, loadCapacity: 15.0, volume: 55.0 },
];

export interface VehicleTypeDef {
  name: string;
  code: string;
  icon: string;
  sort: number;
  length?: number;
  width?: number;
  height?: number;
  loadCapacity?: number;
  volume?: number;
}

/**
 * 定价规则结构
 */
export interface SurgeRule {
  condition: 'peak_hour' | 'weekend' | 'night' | 'rain' | 'custom';
  label: string;
  multiplier: number;
}

export interface PricingRuleDef {
  vehicleTypeCode: string;
  basePrice: number;       // 起步价（元）
  includedKm: number;      // 起步包含公里数
  pricePerKm: number;      // 超出部分每公里单价（元）
  surgeRules?: SurgeRule[];
}

/**
 * 默认定价（可由后台管理调整）
 */
export const DEFAULT_PRICING_RULES: PricingRuleDef[] = [
  { vehicleTypeCode: 'mini_truck', basePrice: 30, includedKm: 5, pricePerKm: 3, surgeRules: [] },
  { vehicleTypeCode: 'small_flatbed', basePrice: 50, includedKm: 5, pricePerKm: 4, surgeRules: [] },
  { vehicleTypeCode: 'small_van', basePrice: 50, includedKm: 5, pricePerKm: 4, surgeRules: [] },
  { vehicleTypeCode: 'm3_8', basePrice: 80, includedKm: 5, pricePerKm: 5, surgeRules: [] },
  { vehicleTypeCode: 'medium_truck', basePrice: 100, includedKm: 5, pricePerKm: 5.5, surgeRules: [] },
  { vehicleTypeCode: 'm5_2', basePrice: 120, includedKm: 5, pricePerKm: 6, surgeRules: [] },
  { vehicleTypeCode: 'm6_2', basePrice: 140, includedKm: 5, pricePerKm: 6.5, surgeRules: [] },
  { vehicleTypeCode: 'm6_8', basePrice: 160, includedKm: 5, pricePerKm: 7, surgeRules: [] },
  { vehicleTypeCode: 'm7_6', basePrice: 180, includedKm: 5, pricePerKm: 7.5, surgeRules: [] },
  { vehicleTypeCode: 'm8_2', basePrice: 200, includedKm: 5, pricePerKm: 8, surgeRules: [] },
  { vehicleTypeCode: 'm8_6', basePrice: 220, includedKm: 5, pricePerKm: 8.5, surgeRules: [] },
  { vehicleTypeCode: 'm9_6', basePrice: 250, includedKm: 5, pricePerKm: 9, surgeRules: [] },
  { vehicleTypeCode: 'm11_7', basePrice: 300, includedKm: 5, pricePerKm: 10, surgeRules: [] },
  { vehicleTypeCode: 'm12_5', basePrice: 350, includedKm: 5, pricePerKm: 11, surgeRules: [] },
  { vehicleTypeCode: 'm13', basePrice: 380, includedKm: 5, pricePerKm: 11.5, surgeRules: [] },
  { vehicleTypeCode: 'm13_7', basePrice: 400, includedKm: 5, pricePerKm: 12, surgeRules: [] },
  { vehicleTypeCode: 'm15', basePrice: 450, includedKm: 5, pricePerKm: 13, surgeRules: [] },
  { vehicleTypeCode: 'm16', basePrice: 500, includedKm: 5, pricePerKm: 14, surgeRules: [] },
  { vehicleTypeCode: 'm17_5', basePrice: 550, includedKm: 5, pricePerKm: 15, surgeRules: [] },
  { vehicleTypeCode: 'reefer', basePrice: 200, includedKm: 5, pricePerKm: 8, surgeRules: [] },
];

/**
 * 附近订单查询半径（km）
 */
export const NEARBY_ORDER_RADIUS_KM = 10;

/**
 * 支付平台手续费比例（百分比）
 */
export const PLATFORM_FEE_RATE = 0.05; // 5%
