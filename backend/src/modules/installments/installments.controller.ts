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
import { InstallmentsService } from './installments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('installments')
@UseGuards(JwtAuthGuard)
export class InstallmentsController {
  constructor(private installmentsService: InstallmentsService) {}

  // Calculate preview (no save)
  @Post('preview')
  calculatePreview(
    @Body('totalAmount') totalAmount: number,
    @Body('numberOfInstallments') numberOfInstallments: number,
  ) {
    return this.installmentsService.calculatePreview(
      totalAmount,
      numberOfInstallments,
    );
  }

  // Create installment plan for an order
  @Post()
  create(
    @Request() req: any,
    @Body('orderId') orderId: string,
    @Body('numberOfInstallments') numberOfInstallments: number,
  ) {
    const userId = req.user.userId || req.user.id;
    return this.installmentsService.createPlan(
      orderId,
      userId,
      numberOfInstallments,
    );
  }

  // Get my plans
  @Get('my')
  getMyPlans(@Request() req: any) {
    const userId = req.user.userId || req.user.id;
    return this.installmentsService.getMyPlans(userId);
  }

  // Get single plan
  @Get(':id')
  getPlan(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId || req.user.id;
    return this.installmentsService.getPlan(id, userId);
  }

  // Get next installment to pay
  @Get(':id/next')
  getNextInstallment(@Param('id') id: string) {
    return this.installmentsService.getNextInstallment(id);
  }

  // ============ Admin ============

  // Admin: Get all plans
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getAllPlans(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.installmentsService.getAllPlans({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
    });
  }
}
