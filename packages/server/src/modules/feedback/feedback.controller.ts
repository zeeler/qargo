import { Controller, Post, Body } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/feedback.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@open-trade/shared';

@Controller('feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateFeedbackDto) {
    return this.feedbackService.create(user.userId, dto);
  }
}
