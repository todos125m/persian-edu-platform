import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalUsers,
      totalCourses,
      totalOrders,
      revenueResult,
      recentOrders,
      topCourses,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.course.count({ where: { deletedAt: null } }),
      this.prisma.order.count(),
      this.prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          finalAmount: true,
          status: true,
          createdAt: true,
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
          items: {
            select: {
              course: { select: { title: true } },
              price: true,
            },
          },
        },
      }),
      this.prisma.orderItem.groupBy({
        by: ['courseId'],
        _sum: { price: true },
        _count: true,
        orderBy: { _sum: { price: 'desc' } },
        take: 5,
      }),
    ]);

    // Get course titles for top courses
    const topCourseIds = topCourses.map((c) => c.courseId);
    const courseTitles = await this.prisma.course.findMany({
      where: { id: { in: topCourseIds } },
      select: { id: true, title: true, studentsCount: true },
    });

    const topCoursesData = topCourses.map((tc) => {
      const course = courseTitles.find((c) => c.id === tc.courseId);
      return {
        title: course?.title || '',
        students: course?.studentsCount || 0,
        revenue: Number(tc._sum.price || 0),
      };
    });

    // Monthly revenue for last 6 months
    const monthlyRevenue = await this.getMonthlyData(
      sixMonthsAgo,
      'payment',
      'SUCCESS',
    );

    // User growth for last 6 months
    const userGrowth = await this.getUserGrowth(sixMonthsAgo);

    return {
      totalUsers,
      totalCourses,
      totalOrders,
      totalRevenue: Number(revenueResult._sum.amount || 0),
      recentOrders,
      monthlyRevenue,
      userGrowth,
      topCourses: topCoursesData,
    };
  }

  private async getMonthlyData(
    since: Date,
    _type: string,
    _status: string,
  ) {
    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        paidAt: { gte: since },
      },
      select: { amount: true, paidAt: true },
    });

    const months = this.getLast6Months();
    return months.map((month) => {
      const monthPayments = payments.filter((p) => {
        if (!p.paidAt) return false;
        const d = new Date(p.paidAt);
        return (
          d.getFullYear() === month.year && d.getMonth() === month.monthIndex
        );
      });
      const amount = monthPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );
      return { month: month.label, amount };
    });
  }

  private async getUserGrowth(since: Date) {
    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: since }, deletedAt: null },
      select: { createdAt: true },
    });

    const months = this.getLast6Months();
    return months.map((month) => {
      const count = users.filter((u) => {
        const d = new Date(u.createdAt);
        return (
          d.getFullYear() === month.year && d.getMonth() === month.monthIndex
        );
      }).length;
      return { month: month.label, count };
    });
  }

  private getLast6Months() {
    const months: { label: string; year: number; monthIndex: number }[] = [];
    const now = new Date();
    const persianMonths = [
      'فروردین',
      'اردیبهشت',
      'خرداد',
      'تیر',
      'مرداد',
      'شهریور',
      'مهر',
      'آبان',
      'آذر',
      'دی',
      'بهمن',
      'اسفند',
    ];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: persianMonths[d.getMonth()] || `${d.getMonth() + 1}`,
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
      });
    }

    return months;
  }
}
