import { Module } from '@nestjs/common';
import { SettlementController } from './settlement.controller';
import { SettlementService } from './settlement.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [SettlementController],
  providers: [SettlementService, PrismaService],
})
export class SettlementModule {}
