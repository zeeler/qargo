import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VEHICLE_TYPES, DEFAULT_PRICING_RULES } from '@open-trade/shared';
import { PriceQueryDto } from './dto/vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(private prisma: PrismaService) {}

  async getTypes() {
    // Try DB first, fall back to constants
    const dbTypes = await this.prisma.vehicleType.findMany({ orderBy: { sort: 'asc' } });
    if (dbTypes.length > 0) return dbTypes;
    return VEHICLE_TYPES;
  }

  async getPricingRules() {
    const dbRules = await this.prisma.pricingRule.findMany();
    if (dbRules.length > 0) return dbRules;
    return DEFAULT_PRICING_RULES;
  }

  async calculatePrice(dto: PriceQueryDto) {
    const { vehicleTypeCode, pickupLng, pickupLat, dropoffLng, dropoffLat, userAdditionalFee } = dto;

    // 计算距离（Mock: 直线距离 ≈ 实际距离的 1.3倍）
    const R = 6371; // 地球半径 km
    const dLat = this.toRad(dropoffLat - pickupLat);
    const dLng = this.toRad(dropoffLng - pickupLng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(pickupLat)) * Math.cos(this.toRad(dropoffLat)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDistance = R * c;
    const distanceKm = Math.round(straightDistance * 1.3 * 100) / 100; // 折算为道路距离

    // 获取定价规则
    const rule = await this.prisma.pricingRule.findFirst({
      where: { vehicleTypeCode },
      orderBy: { effectiveDate: 'desc' },
    });

    const pricing = rule || DEFAULT_PRICING_RULES.find((r) => r.vehicleTypeCode === vehicleTypeCode);

    if (!pricing) {
      throw new Error(`未找到车型 ${vehicleTypeCode} 的定价规则`);
    }

    const basePrice = pricing.basePrice;
    const extraKm = Math.max(0, distanceKm - pricing.includedKm);
    const distancePrice = Math.round(extraKm * pricing.pricePerKm * 100) / 100;

    // 计算浮动费用（Mock）
    const surgeFee = 0;

    const totalPrice = Math.round((basePrice + distancePrice + surgeFee + (userAdditionalFee || 0)) * 100) / 100;

    return { distanceKm, basePrice, distancePrice, surgeFee, userAdditionalFee: userAdditionalFee || 0, totalPrice };
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
