import { Module } from '@nestjs/common';
import { ChargilyService } from './chargily.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, ChargilyService],
})
export class PaymentsModule {}
