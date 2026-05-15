import { Controller, Post, Get, Body } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@open-trade/shared';
import { CreateComplaintDto } from './dto/complaint.dto';

@Controller('complaint')
export class ComplaintController {
  constructor(private complaintService: ComplaintService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateComplaintDto) {
    return this.complaintService.create(user.userId, dto);
  }

  @Get('my')
  findMy(@CurrentUser() user: JwtPayload) {
    return this.complaintService.findMyComplaints(user.userId);
  }
}
