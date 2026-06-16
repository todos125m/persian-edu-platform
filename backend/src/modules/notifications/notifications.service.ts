import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Get user's notifications (paginated)
  async findByUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get unread count
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { unreadCount: count };
  }

  // Mark single notification as read
  async markAsRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('اعلان یافت نشد');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'همه اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند' };
  }

  // Admin: Send notification to user(s)
  async sendNotification(
    userIds: string[],
    title: string,
    message: string,
    type?: string,
    link?: string,
  ) {
    const data = userIds.map((userId) => ({
      userId,
      title,
      message,
      type: type || 'info',
      link: link || null,
    }));

    await this.prisma.notification.createMany({
      data,
    });

    return { message: `اعلان با موفقیت برای ${userIds.length} کاربر ارسال شد` };
  }

  // Helper: Create a notification for a single user
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type?: string,
    link?: string,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'info',
        link: link || null,
      },
    });
  }
}
