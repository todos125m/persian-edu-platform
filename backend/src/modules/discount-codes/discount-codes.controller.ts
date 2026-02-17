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
} from '@nestjs/common';
import { DiscountCodesService } from './discount-codes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('discount-codes')
export class DiscountCodesController {
  constructor(private discountCodesService: DiscountCodesService) {}

  // Public: Validate code
  @Post('validate')
  @UseGuards(JwtAuthGuard)
  validate(@Body() body: { code: string; totalAmount: number }) {
    return this.discountCodesService.validate(body.code, body.totalAmount);
  }

  // ============ Admin ============

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.discountCodesService.adminFindAll(+page, +limit);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminCreate(@Body() body: any) {
    return this.discountCodesService.adminCreate(body);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminUpdate(@Param('id') id: string, @Body() body: any) {
    return this.discountCodesService.adminUpdate(id, body);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminDelete(@Param('id') id: string) {
    return this.discountCodesService.adminDelete(id);
  }
}
