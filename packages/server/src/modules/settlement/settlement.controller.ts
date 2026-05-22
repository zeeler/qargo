import { Controller, Get, Post, Put, Param } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('settlement')
@Roles('admin')
export class SettlementController {
  constructor(private settlementService: SettlementService) {}

  @Post('generate')
  generate() {
    return this.settlementService.generate();
  }

  @Get()
  findAll() {
    return this.settlementService.findAll();
  }

  @Put(':id/settle')
  settle(@Param('id') id: string) {
    return this.settlementService.settle(id);
  }
}
