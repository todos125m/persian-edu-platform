import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ZarinpalService } from './gateways/zarinpal.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [HttpModule, OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, ZarinpalService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
