import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // User: Create order
  async create(userId: string, courseIds: string[]) {
    // Validate courses exist and get prices
    const courses = await this.prisma.course.findMany({
      where: {
        id: { in: courseIds },
        status: 'PUBLISHED',
        deletedAt: null,
      },
    });

    if (courses.length !== courseIds.length) {
      throw new BadRequestException('یک یا چند دوره یافت نشد');
    }

    // Check if user already owns any of these courses
    const existingEnrollments = await this.prisma.userCourse.findMany({
      where: {
        userId,
        courseId: { in: courseIds },
      },
    });

    if (existingEnrollments.length > 0) {
      throw new BadRequestException('شما قبلاً یک یا چند دوره از این لیست را خریداری کرده‌اید');
    }

    // Calculate totals
    const now = new Date();
    let totalAmount = 0;
    let discountAmount = 0;

    const orderItems = courses.map((course) => {
      const price = Number(course.price);
      const discountPrice = course.discountPrice ? Number(course.discountPrice) : null;
      const hasDiscount = discountPrice && course.discountExpiry && course.discountExpiry > now;

      const finalPrice = hasDiscount ? discountPrice : price;
      totalAmount += price;
      if (hasDiscount) {
        discountAmount += price - discountPrice;
      }

      return {
        courseId: course.id,
        price: finalPrice,
      };
    });

    const finalAmount = totalAmount - discountAmount;

    // Generate order number
    const orderNumber = this.generateOrderNumber();

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId,
        totalAmount,
        discountAmount,
        finalAmount,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            course: {
              select: { title: true, thumbnail: true },
            },
          },
        },
      },
    });

    return order;
  }

  // User: Get my orders
  async findUserOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              course: {
                select: { title: true, thumbnail: true, slug: true },
              },
            },
          },
          payment: {
            select: { status: true, paidAt: true },
          },
        },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // User: Get single order
  async findOne(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            course: {
              select: { id: true, title: true, thumbnail: true, slug: true },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('سفارش یافت نشد');
    }

    return order;
  }

  // Admin: Get all orders
  async findAll(page = 1, limit = 10, status?: OrderStatus) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
          items: {
            include: {
              course: {
                select: { title: true },
              },
            },
          },
          payment: {
            select: { status: true, gateway: true },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Complete order after successful payment
  async completeOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('سفارش یافت نشد');
    }

    // Wrap everything in a transaction to prevent partial state
    await this.prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
      });

      // Create user course enrollments
      const enrollments = order.items.map((item) => ({
        userId: order.userId,
        courseId: item.courseId,
      }));

      await tx.userCourse.createMany({
        data: enrollments,
        skipDuplicates: true,
      });

      // Increment students count atomically
      for (const item of order.items) {
        await tx.course.update({
          where: { id: item.courseId },
          data: { studentsCount: { increment: 1 } },
        });
      }
    });

    return { message: 'سفارش با موفقیت تکمیل شد' };
  }

  // Helper: Generate order number
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }
}
