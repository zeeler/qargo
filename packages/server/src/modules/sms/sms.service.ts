import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  // Mock SMS — 生产环境替换为阿里云短信
  private codes = new Map<string, { code: string; expiresAt: Date }>();

  async sendCode(phone: string): Promise<void> {
    const code = '123456'; // Mock 固定验证码，方便开发调试
    this.codes.set(phone, {
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Mock: 打印验证码到控制台
    console.log(`[SMS Mock] 发送验证码 ${code} 到手机 ${phone}`);
  }

  verifyCode(phone: string, code: string): boolean {
    const record = this.codes.get(phone);
    if (!record) return false;
    if (new Date() > record.expiresAt) {
      this.codes.delete(phone);
      return false;
    }
    const isValid = record.code === code;
    if (isValid) this.codes.delete(phone);
    return isValid;
  }
}
