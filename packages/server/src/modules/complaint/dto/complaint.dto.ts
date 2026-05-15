import { IsString, IsEnum } from 'class-validator';
import { ComplaintType } from '@open-trade/shared';

export class CreateComplaintDto {
  @IsString()
  orderId: string;

  @IsEnum(ComplaintType)
  type: ComplaintType;

  @IsString()
  content: string;
}
