export interface CreateReviewDto {
  orderId: string;
  rating: number;
  content?: string;
}

export interface ReviewVo {
  id: string;
  orderId: string;
  userId: string;
  driverId: string;
  rating: number;
  content?: string;
  createdAt: string;
}
