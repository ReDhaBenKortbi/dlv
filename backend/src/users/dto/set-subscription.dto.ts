import { IsBoolean } from 'class-validator';

export class SetSubscriptionDto {
  @IsBoolean()
  isSubscribed: boolean;
}
