import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // User: Create order
  @Post()
  create(@Request() req: any, @Body() body: { courseIds: string[]; couponCode?: string }) {
    return this.ordersService.create(req.user.id, body.courseIds, body.couponCode);
  }

  // User: Get my orders
  @Get('me')
  findMyOrders(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.ordersService.findUserOrders(req.user.id, +page, +limit);
  }

  // User: Get single order
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.findOne(id, req.user.id);
  }

  // Admin: Get all orders
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findAll(+page, +limit, status);
  }
}
