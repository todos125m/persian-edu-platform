import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { PaymentGateway } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // User: Initiate payment
  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  initiatePayment(
    @Request() req: any,
    @Body('orderId') orderId: string,
    @Body('gateway') gateway?: PaymentGateway,
  ) {
    return this.paymentsService.initiatePayment(orderId, req.user.id, gateway);
  }

  // Payment callback (public - called by gateway)
  @Get('verify')
  verifyPayment(
    @Query('Authority') authority: string,
    @Query('Status') status: string,
  ) {
    return this.paymentsService.verifyPayment(authority, status);
  }

  // Admin: Get payment stats
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getStats() {
    return this.paymentsService.getStats();
  }
}
