import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DriverRegisterDto, UpdateLocationDto } from './dto/driver.dto';

@Injectable()
export class DriverService {
  constructor(private prisma: PrismaService) {}

  async register(userId: string, dto: DriverRegisterDto) {
    const existing = await this.prisma.driver.findUnique({ where: { userId } });
    if (existing) throw new BadRequestException('您已注册为司机');

    const driver = await this.prisma.driver.create({
      data: {
        userId,
        realName: dto.realName,
        idCard: dto.idCard,
        licenseInfo: dto.licenseInfo,
        vehicle: {
          create: { ...dto.vehicle, photos: [] },
        },
      },
      include: { vehicle: true },
    });

    // 更新用户角色为driver
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'driver' },
    });

    return driver;
  }

  async getStatus(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      include: { vehicle: true },
    });
    if (!driver) return { registered: false };
    return { registered: true, status: driver.status, driver };
  }

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    return this.prisma.driver.update({
      where: { userId },
      data: { currentLng: dto.lng, currentLat: dto.lat },
    });
  }
}
