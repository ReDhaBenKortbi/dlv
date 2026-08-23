import { IsEnum } from 'class-validator';
import { SubscriptionPlan } from '@prisma/client';

export class UpdateUserTierDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;
}
