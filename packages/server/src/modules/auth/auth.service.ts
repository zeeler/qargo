import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
import { RegisterDto, LoginDto, SendCodeDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private smsService: SmsService,
  ) {}

  async sendCode(dto: SendCodeDto) {
    await this.smsService.sendCode(dto.phone);
    return { message: '验证码已发送' };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) throw new BadRequestException('该手机号已注册');

    const isValid = this.smsService.verifyCode(dto.phone, dto.code);
    if (!isValid) throw new BadRequestException('验证码错误或已过期');

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        name: dto.name,
        role: dto.role || 'customer',
        defaultAddress: dto.defaultAddress,
      },
    });

    return this.generateTokens(user.id, user.phone, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) throw new UnauthorizedException('用户未注册');

    const isValid = this.smsService.verifyCode(dto.phone, dto.code);
    if (!isValid) throw new BadRequestException('验证码错误或已过期');

    return this.generateTokens(user.id, user.phone, user.role);
  }

  private generateTokens(userId: string, phone: string, role: string) {
    const payload = { userId, phone, role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }
}
