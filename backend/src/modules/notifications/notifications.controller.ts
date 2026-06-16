import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // Get user's notifications (paginated)
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Req() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.notificationsService.findByUser(req.user.userId, +page, +limit);
  }

  // Get unread count
  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(req.user.userId);
  }

  // Mark single notification as read
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user.userId, id);
  }

  // Mark all notifications as read
  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  // ============ Admin Routes ============

  // Admin: Send notification to user(s)
  @Post('admin/send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  sendNotification(
    @Body() body: {
      userIds: string[];
      title: string;
      message: string;
      type?: string;
      link?: string;
    },
  ) {
    return this.notificationsService.sendNotification(
      body.userIds,
      body.title,
      body.message,
      body.type,
      body.link,
    );
  }
}
