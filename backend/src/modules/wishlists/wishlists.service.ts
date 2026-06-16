import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WishlistsService {
  constructor(private prisma: PrismaService) {}

  // Get user's wishlist
  async findByUser(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            price: true,
            discountPrice: true,
            discountExpiry: true,
            level: true,
            duration: true,
            lessonsCount: true,
            studentsCount: true,
            category: {
              select: { id: true, name: true, nameFA: true, slug: true },
            },
          },
        },
      },
    });
  }

  // Toggle wishlist (add/remove)
  async toggle(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('دوره یافت نشد');
    }

    const existing = await this.prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existing) {
      // Remove from wishlist
      await this.prisma.wishlist.delete({
        where: { id: existing.id },
      });

      return { added: false, message: 'دوره از علاقه‌مندی‌ها حذف شد' };
    }

    // Add to wishlist
    await this.prisma.wishlist.create({
      data: {
        userId,
        courseId,
      },
    });

    return { added: true, message: 'دوره به علاقه‌مندی‌ها اضافه شد' };
  }
}
