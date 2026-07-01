import { IsIn } from 'class-validator';
import { SubscriptionPlan } from '@prisma/client';

// Only paid tiers can be checked out; FREE would create a 0 DZD checkout.
const PAID_PLANS: SubscriptionPlan[] = ['PRO', 'GOLD'];

export class CreateCheckoutDto {
  @IsIn(PAID_PLANS, { message: 'plan must be PRO or GOLD' })
  plan: SubscriptionPlan;
}
