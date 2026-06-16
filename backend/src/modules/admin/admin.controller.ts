import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard/stats')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Post('grant-access')
  grantCourseAccess(
    @Body() body: { userId: string; courseId: string },
  ) {
    return this.adminService.grantCourseAccess(body.userId, body.courseId);
  }

  @Delete('revoke-access/:userId/:courseId')
  revokeCourseAccess(
    @Param('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.adminService.revokeCourseAccess(userId, courseId);
  }
}
