import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // Public: Get reviews for a course
  @Get('course/:courseId')
  findByCourse(
    @Param('courseId') courseId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reviewsService.findByCourse(courseId, +page, +limit);
  }

  // User: Create review
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: any,
    @Body() body: { courseId: string; rating: number; comment?: string },
  ) {
    return this.reviewsService.create(req.user.userId, body.courseId, body.rating, body.comment);
  }

  // User: Update review
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { rating: number; comment?: string },
  ) {
    return this.reviewsService.update(req.user.userId, id, body.rating, body.comment);
  }

  // User: Delete review
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req: any, @Param('id') id: string) {
    return this.reviewsService.remove(req.user.userId, id);
  }

  // ============ Admin ============

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('approved') approved?: string) {
    return this.reviewsService.adminFindAll(+page, +limit, approved);
  }

  @Patch('admin/:id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminToggle(@Param('id') id: string) {
    return this.reviewsService.adminToggleApprove(id);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminDelete(@Param('id') id: string) {
    return this.reviewsService.adminDelete(id);
  }
}
