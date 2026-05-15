import { ComplaintType } from '../constants/enums';

export interface CreateComplaintDto {
  orderId: string;
  type: ComplaintType;
  content: string;
}

export interface ComplaintVo {
  id: string;
  orderId: string;
  complainantId: string;
  type: string;
  content: string;
  status: string;
  resolution?: string;
  createdAt: string;
}
