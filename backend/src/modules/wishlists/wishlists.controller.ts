import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wishlists')
export class WishlistsController {
  constructor(private wishlistsService: WishlistsService) {}

  // Get user's wishlist
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req: any) {
    return this.wishlistsService.findByUser(req.user.userId);
  }

  // Toggle wishlist (add/remove)
  @Post(':courseId')
  @UseGuards(JwtAuthGuard)
  toggle(@Req() req: any, @Param('courseId') courseId: string) {
    return this.wishlistsService.toggle(req.user.userId, courseId);
  }
}
