import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class InstallmentsService {
  private readonly logger = new Logger(InstallmentsService.name);

  constructor(private prisma: PrismaService) {}

  // Create installment plan for an order
  async createPlan(
    orderId: string,
    userId: string,
    numberOfInstallments: number,
  ) {
    // Validate installment count (2-6 months)
    if (numberOfInstallments < 2 || numberOfInstallments > 6) {
      throw new BadRequestException('تعداد اقساط باید بین ۲ تا ۶ باشد');
    }

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId, status: OrderStatus.PENDING },
      include: { installmentPlan: true },
    });

    if (!order) {
      throw new NotFoundException('سفارش یافت نشد یا قبلاً پرداخت شده');
    }

    if (order.installmentPlan) {
      throw new BadRequestException('این سفارش قبلاً پلن اقساطی دارد');
    }

    // Minimum order amount for installment
    const totalAmount = Number(order.finalAmount);
    if (totalAmount < 500000) {
      throw new BadRequestException(
        'حداقل مبلغ سفارش برای پرداخت اقساطی ۵۰۰,۰۰۰ تومان است',
      );
    }

    // Calculate: 30% down payment, rest in equal installments
    const downPayment = Math.ceil(totalAmount * 0.3);
    const remainingAmount = totalAmount - downPayment;
    const monthlyAmount = Math.ceil(remainingAmount / numberOfInstallments);

    // Create plan and installments
    const plan = await this.prisma.installmentPlan.create({
      data: {
        orderId,
        totalAmount: order.finalAmount,
        downPayment,
        monthlyAmount,
        totalInstallments: numberOfInstallments,
        installments: {
          create: Array.from({ length: numberOfInstallments }, (_, i) => ({
            installmentNumber: i + 1,
            amount: i === numberOfInstallments - 1
              ? remainingAmount - monthlyAmount * (numberOfInstallments - 1) // آخری رو تنظیم کن
              : monthlyAmount,
            dueDate: new Date(
              Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000, // هر ۳۰ روز
            ),
          })),
        },
      },
      include: {
        installments: { orderBy: { installmentNumber: 'asc' } },
      },
    });

    return plan;
  }

  // Get user's installment plans
  async getMyPlans(userId: string) {
    return this.prisma.installmentPlan.findMany({
      where: { order: { userId } },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            items: {
              include: {
                course: { select: { title: true, thumbnail: true } },
              },
            },
          },
        },
        installments: { orderBy: { installmentNumber: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get single plan
  async getPlan(planId: string, userId: string) {
    const plan = await this.prisma.installmentPlan.findUnique({
      where: { id: planId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            userId: true,
            items: {
              include: {
                course: { select: { title: true, thumbnail: true } },
              },
            },
          },
        },
        installments: { orderBy: { installmentNumber: 'asc' } },
      },
    });

    if (!plan) {
      throw new NotFoundException('پلن اقساطی یافت نشد');
    }

    if (plan.order.userId !== userId) {
      throw new ForbiddenException('شما دسترسی به این پلن ندارید');
    }

    return plan;
  }

  // Get next unpaid installment for a plan
  async getNextInstallment(planId: string) {
    return this.prisma.installment.findFirst({
      where: {
        planId,
        status: PaymentStatus.PENDING,
      },
      orderBy: { installmentNumber: 'asc' },
    });
  }

  // Record installment payment (called after payment verification)
  async recordInstallmentPayment(
    installmentId: string,
    refId: string,
  ) {
    const installment = await this.prisma.installment.findUnique({
      where: { id: installmentId },
      include: {
        plan: true,
      },
    });

    if (!installment) {
      throw new NotFoundException('قسط یافت نشد');
    }

    // Update installment
    await this.prisma.installment.update({
      where: { id: installmentId },
      data: {
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
        refId,
      },
    });

    // Update plan paid count
    const paidCount = await this.prisma.installment.count({
      where: {
        planId: installment.planId,
        status: PaymentStatus.SUCCESS,
      },
    });

    const isCompleted = paidCount >= installment.plan.totalInstallments;

    await this.prisma.installmentPlan.update({
      where: { id: installment.planId },
      data: {
        paidInstallments: paidCount,
        status: isCompleted ? 'COMPLETED' : 'ACTIVE',
      },
    });

    // Unlock course access if no more overdue installments
    await this.unlockAfterPayment(installment.planId);

    return { paidCount, isCompleted };
  }

  // Admin: Get all installment plans
  async getAllPlans(params: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const { page = 1, limit = 20, status } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [plans, total] = await Promise.all([
      this.prisma.installmentPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              items: {
                include: {
                  course: { select: { title: true } },
                },
              },
            },
          },
          installments: { orderBy: { installmentNumber: 'asc' } },
        },
      }),
      this.prisma.installmentPlan.count({ where }),
    ]);

    return {
      data: plans,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============ Lock/Unlock Methods ============

  // Cron: Check overdue installments every day at 2 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async checkOverdueInstallments() {
    this.logger.log('Checking overdue installments...');

    // Find all active plans with overdue unpaid installments
    const overduePlans = await this.prisma.installmentPlan.findMany({
      where: {
        status: 'ACTIVE',
        installments: {
          some: {
            status: PaymentStatus.PENDING,
            dueDate: { lt: new Date() },
          },
        },
      },
      include: {
        order: {
          select: {
            id: true,
            userId: true,
            items: {
              select: { courseId: true },
            },
          },
        },
      },
    });

    let lockedCount = 0;

    for (const plan of overduePlans) {
      // Mark plan as overdue
      await this.prisma.installmentPlan.update({
        where: { id: plan.id },
        data: { status: 'OVERDUE' },
      });

      // Lock access to all courses in this order
      for (const item of plan.order.items) {
        if (item.courseId) {
          await this.prisma.userCourse.updateMany({
            where: {
              userId: plan.order.userId,
              courseId: item.courseId,
              isLocked: false,
            },
            data: { isLocked: true },
          });
          lockedCount++;
        }
      }
    }

    this.logger.log(`Overdue check complete. Locked ${lockedCount} course accesses.`);
  }

  // Unlock access after installment payment
  async unlockAfterPayment(planId: string) {
    const plan = await this.prisma.installmentPlan.findUnique({
      where: { id: planId },
      include: {
        order: {
          select: {
            userId: true,
            items: { select: { courseId: true } },
          },
        },
        installments: {
          where: {
            status: PaymentStatus.PENDING,
            dueDate: { lt: new Date() },
          },
        },
      },
    });

    if (!plan) return;

    // Only unlock if no more overdue installments remain
    if (plan.installments.length === 0) {
      // Reactivate plan if it was overdue
      if (plan.status === 'OVERDUE') {
        await this.prisma.installmentPlan.update({
          where: { id: planId },
          data: { status: 'ACTIVE' },
        });
      }

      // Unlock all courses
      for (const item of plan.order.items) {
        if (item.courseId) {
          await this.prisma.userCourse.updateMany({
            where: {
              userId: plan.order.userId,
              courseId: item.courseId,
            },
            data: { isLocked: false },
          });
        }
      }
    }
  }

  // Calculate installment preview (no DB)
  calculatePreview(totalAmount: number, numberOfInstallments: number) {
    const downPayment = Math.ceil(totalAmount * 0.3);
    const remainingAmount = totalAmount - downPayment;
    const monthlyAmount = Math.ceil(remainingAmount / numberOfInstallments);

    return {
      totalAmount,
      downPayment,
      monthlyAmount,
      numberOfInstallments,
      installments: Array.from({ length: numberOfInstallments }, (_, i) => ({
        number: i + 1,
        amount:
          i === numberOfInstallments - 1
            ? remainingAmount - monthlyAmount * (numberOfInstallments - 1)
            : monthlyAmount,
        dueDate: new Date(
          Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      })),
    };
  }
}
