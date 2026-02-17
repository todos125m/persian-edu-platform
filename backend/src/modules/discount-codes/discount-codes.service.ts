import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DiscountCodesService {
  constructor(private prisma: PrismaService) {}

  // Public: Validate a discount code
  async validate(code: string, totalAmount: number) {
    const discount = await this.prisma.discountCode.findUnique({
      where: { code },
    });

    if (!discount) throw new NotFoundException('کد تخفیف یافت نشد');
    if (!discount.isActive) throw new BadRequestException('کد تخفیف غیرفعال است');
    if (discount.expiresAt && discount.expiresAt < new Date()) {
      throw new BadRequestException('کد تخفیف منقضی شده است');
    }
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      throw new BadRequestException('ظرفیت استفاده از این کد تمام شده است');
    }
    if (discount.minAmount && totalAmount < Number(discount.minAmount)) {
      throw new BadRequestException(
        `حداقل مبلغ سفارش برای این کد ${Number(discount.minAmount).toLocaleString('fa-IR')} تومان است`,
      );
    }

    let discountAmount: number;
    if (discount.type === 'PERCENT') {
      discountAmount = Math.round((totalAmount * Number(discount.value)) / 100);
    } else {
      discountAmount = Math.min(Number(discount.value), totalAmount);
    }

    return {
      code: discount.code,
      type: discount.type,
      value: Number(discount.value),
      discountAmount,
      finalAmount: totalAmount - discountAmount,
    };
  }

  // Apply discount (increment usedCount)
  async apply(code: string) {
    await this.prisma.discountCode.update({
      where: { code },
      data: { usedCount: { increment: 1 } },
    });
  }

  // ============ Admin ============

  async adminFindAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [codes, total] = await Promise.all([
      this.prisma.discountCode.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { orders: true } } },
      }),
      this.prisma.discountCode.count(),
    ]);

    return {
      data: codes,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminCreate(data: {
    code: string;
    description?: string;
    type: 'PERCENT' | 'FIXED';
    value: number;
    maxUses?: number;
    minAmount?: number;
    expiresAt?: string;
  }) {
    const existing = await this.prisma.discountCode.findUnique({
      where: { code: data.code },
    });
    if (existing) throw new BadRequestException('این کد تخفیف قبلاً ثبت شده');

    return this.prisma.discountCode.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        type: data.type,
        value: data.value,
        maxUses: data.maxUses,
        minAmount: data.minAmount,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  async adminUpdate(id: string, data: {
    description?: string;
    type?: 'PERCENT' | 'FIXED';
    value?: number;
    maxUses?: number;
    minAmount?: number;
    isActive?: boolean;
    expiresAt?: string;
  }) {
    const updateData: any = { ...data };
    if (data.expiresAt) updateData.expiresAt = new Date(data.expiresAt);
    return this.prisma.discountCode.update({ where: { id }, data: updateData });
  }

  async adminDelete(id: string) {
    return this.prisma.discountCode.delete({ where: { id } });
  }
}
