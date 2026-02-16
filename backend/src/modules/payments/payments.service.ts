import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { ZarinpalService } from './gateways/zarinpal.service';
import { PaymentStatus, PaymentGateway, OrderStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private ordersService: OrdersService,
    private zarinpal: ZarinpalService,
  ) {}

  // Initiate payment
  async initiatePayment(orderId: string, userId: string, gateway: PaymentGateway = PaymentGateway.ZARINPAL) {
    // Get order
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        user: {
          select: { email: true, phone: true },
        },
        items: {
          include: {
            course: {
              select: { title: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('سفارش یافت نشد');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('این سفارش قبلاً پرداخت شده یا لغو شده است');
    }

    // Create description
    const courseNames = order.items.map((i) => i.course.title).join('، ');
    const description = `خرید دوره: ${courseNames}`;

    // Get callback URL
    const frontendUrl = this.configService.get('FRONTEND_URL');
    const callbackUrl = `${frontendUrl}/payment/callback`;

    let authority: string;
    let paymentUrl: string;

    // Request payment based on gateway
    if (gateway === PaymentGateway.ZARINPAL) {
      const result = await this.zarinpal.requestPayment(
        Number(order.finalAmount),
        description,
        callbackUrl,
        order.user.email,
        order.user.phone ?? undefined,
      );
      authority = result.authority;
      paymentUrl = result.paymentUrl;
    } else {
      throw new BadRequestException('درگاه پرداخت انتخاب شده پشتیبانی نمی‌شود');
    }

    // Create payment record
    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.finalAmount,
        gateway,
        authority,
        status: PaymentStatus.PENDING,
      },
    });

    return { paymentUrl };
  }

  // Verify payment (callback)
  async verifyPayment(authority: string, status: string) {
    // Find payment
    const payment = await this.prisma.payment.findFirst({
      where: { authority },
      include: {
        order: true,
      },
    });

    if (!payment) {
      return { success: false, message: 'پرداخت یافت نشد' };
    }

    // Idempotency: if payment already processed, return immediately
    if (payment.status !== PaymentStatus.PENDING) {
      return {
        success: payment.status === PaymentStatus.SUCCESS,
        alreadyProcessed: true,
        message: payment.status === PaymentStatus.SUCCESS
          ? 'پرداخت قبلاً تأیید شده است'
          : 'پرداخت قبلاً ناموفق بوده است',
        orderId: payment.orderId,
        refId: payment.refId ?? undefined,
      };
    }

    // If user cancelled - wrap in transaction
    if (status === 'NOK') {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.CANCELLED },
        }),
        this.prisma.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.CANCELLED },
        }),
      ]);

      return { success: false, message: 'پرداخت لغو شد', orderId: payment.orderId };
    }

    // Verify with gateway
    let verifyResult;

    if (payment.gateway === PaymentGateway.ZARINPAL) {
      verifyResult = await this.zarinpal.verifyPayment(
        authority,
        Number(payment.amount),
      );
    }

    if (verifyResult?.success) {
      // Update payment
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
          refId: verifyResult.refId,
          cardNumber: verifyResult.cardNumber,
          paidAt: new Date(),
        },
      });

      // Complete order (enrollments)
      await this.ordersService.completeOrder(payment.orderId);

      return {
        success: true,
        message: 'پرداخت با موفقیت انجام شد',
        orderId: payment.orderId,
        refId: verifyResult.refId,
      };
    } else {
      // Payment failed - wrap in transaction
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.FAILED },
        }),
        this.prisma.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.FAILED },
        }),
      ]);

      return {
        success: false,
        message: 'پرداخت ناموفق بود',
        orderId: payment.orderId,
      };
    }
  }

  // Admin: Get payment statistics
  async getStats() {
    const [totalPayments, successfulPayments, totalRevenue] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: PaymentStatus.SUCCESS } }),
      this.prisma.payment.aggregate({
        where: { status: PaymentStatus.SUCCESS },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalPayments,
      successfulPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
      successRate: totalPayments > 0 
        ? Math.round((successfulPayments / totalPayments) * 100) 
        : 0,
    };
  }
}
