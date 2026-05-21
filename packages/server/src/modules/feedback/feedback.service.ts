import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateFeedbackDto) {
    return this.prisma.feedback.create({
      data: { userId, ...dto },
    });
  }
}
