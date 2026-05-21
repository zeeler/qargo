import { IsString, Matches } from 'class-validator';

const PHONE_REGEX = /^1[3-9]\d{9}$/;

export class CreateFeedbackDto {
  @IsString()
  name: string;

  @Matches(PHONE_REGEX, { message: '请输入正确的手机号' })
  phone: string;

  @IsString()
  content: string;
}
