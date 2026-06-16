import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  // User: Create ticket
  async create(userId: string, dto: CreateTicketDto) {
    const ticket = await this.prisma.ticket.create({
      data: {
        subject: dto.subject,
        priority: (dto.priority as any) || 'MEDIUM',
        department: dto.department || 'support',
        userId,
        messages: {
          create: {
            body: dto.body,
            userId,
            isAdmin: false,
          },
        },
      },
      include: {
        messages: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        },
      },
    });

    return ticket;
  }

  // User: Get my tickets
  async findMyTickets(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.ticket.count({ where: { userId } }),
    ]);

    return {
      data: tickets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // User: Get single ticket (with messages)
  async findOne(ticketId: string, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('تیکت یافت نشد');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('شما دسترسی به این تیکت ندارید');
    }

    return ticket;
  }

  // User: Reply to ticket
  async reply(ticketId: string, userId: string, dto: ReplyTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('تیکت یافت نشد');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('شما دسترسی به این تیکت ندارید');
    }

    if (ticket.status === 'CLOSED') {
      throw new ForbiddenException('این تیکت بسته شده و امکان پاسخ‌دهی ندارد');
    }

    const message = await this.prisma.ticketMessage.create({
      data: {
        body: dto.body,
        ticketId,
        userId,
        isAdmin: false,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Update ticket status to WAITING (user replied, waiting for admin)
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'WAITING' },
    });

    return message;
  }

  // User: Close ticket
  async close(ticketId: string, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('تیکت یافت نشد');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('شما دسترسی به این تیکت ندارید');
    }

    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
  }

  // ============ Admin Methods ============

  // Admin: Get all tickets
  async findAll(params: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, priority, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Admin: Get single ticket
  async findOneAdmin(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('تیکت یافت نشد');
    }

    return ticket;
  }

  // Admin: Reply to ticket
  async adminReply(ticketId: string, adminId: string, dto: ReplyTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('تیکت یافت نشد');
    }

    const message = await this.prisma.ticketMessage.create({
      data: {
        body: dto.body,
        ticketId,
        userId: adminId,
        isAdmin: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Update ticket status to ANSWERED
    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'ANSWERED' },
    });

    return message;
  }

  // Admin: Close ticket
  async adminClose(ticketId: string) {
    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED', closedAt: new Date() },
    });
  }

  // Admin: Change status
  async changeStatus(ticketId: string, status: string) {
    return this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: status as any,
        ...(status === 'CLOSED' ? { closedAt: new Date() } : {}),
      },
    });
  }
}
