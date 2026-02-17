import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // Public: Get approved reviews for a course
  async findByCourse(courseId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      this.prisma.review.findMany({
        where: { courseId, isApproved: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, avatar: true } },
        },
      }),
      this.prisma.review.count({ where: { courseId, isApproved: true } }),
      this.prisma.review.aggregate({
        where: { courseId, isApproved: true },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    return {
      data: reviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: {
        average: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0,
        count: stats._count,
      },
    };
  }

  // User: Create review
  async create(userId: string, courseId: string, rating: number, comment?: string) {
    if (rating < 1 || rating > 5) throw new BadRequestException('امتیاز باید بین ۱ تا ۵ باشد');

    // Check user owns this course
    const enrollment = await this.prisma.userCourse.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) throw new BadRequestException('شما ابتدا باید در این دوره ثبت‌نام کنید');

    // Check duplicate
    const existing = await this.prisma.review.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) throw new BadRequestException('شما قبلاً نظر خود را ثبت کرده‌اید');

    return this.prisma.review.create({
      data: { userId, courseId, rating, comment },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });
  }

  // User: Update own review
  async update(userId: string, reviewId: string, rating: number, comment?: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, userId },
    });
    if (!review) throw new NotFoundException('نظر یافت نشد');

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { rating, comment, isApproved: false },
    });
  }

  // User: Delete own review
  async remove(userId: string, reviewId: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, userId },
    });
    if (!review) throw new NotFoundException('نظر یافت نشد');
    return this.prisma.review.delete({ where: { id: reviewId } });
  }

  // ============ Admin ============

  async adminFindAll(page = 1, limit = 10, approved?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (approved === 'true') where.isApproved = true;
    if (approved === 'false') where.isApproved = false;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          course: { select: { title: true } },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminToggleApprove(reviewId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('نظر یافت نشد');

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: !review.isApproved },
    });
  }

  async adminDelete(reviewId: string) {
    return this.prisma.review.delete({ where: { id: reviewId } });
  }
}
