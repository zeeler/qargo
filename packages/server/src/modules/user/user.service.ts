import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true, name: true, role: true, avatar: true, defaultAddress: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, phone: true, name: true, role: true, avatar: true, defaultAddress: true },
    });
  }

  async getAddresses(userId: string) {
    return this.prisma.userAddress.findMany({ where: { userId } });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.userAddress.create({ data: { ...dto, userId } });
  }

  async deleteAddress(userId: string, addressId: string) {
    return this.prisma.userAddress.deleteMany({ where: { id: addressId, userId } });
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return this.prisma.userAddress.updateMany({
      where: { id: addressId, userId },
      data: dto,
    });
  }
}
