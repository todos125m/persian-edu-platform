import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  // ============ User Endpoints ============

  // Create a new ticket
  @Post()
  create(@Request() req: any, @Body() dto: CreateTicketDto) {
    const userId = req.user.userId || req.user.id;
    return this.ticketsService.create(userId, dto);
  }

  // Get my tickets
  @Get('my')
  findMyTickets(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.userId || req.user.id;
    return this.ticketsService.findMyTickets(
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  // Get single ticket (user view)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId || req.user.id;
    return this.ticketsService.findOne(id, userId);
  }

  // Reply to my ticket
  @Post(':id/reply')
  reply(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: ReplyTicketDto,
  ) {
    const userId = req.user.userId || req.user.id;
    return this.ticketsService.reply(id, userId, dto);
  }

  // Close my ticket
  @Patch(':id/close')
  close(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId || req.user.id;
    return this.ticketsService.close(id, userId);
  }

  // ============ Admin Endpoints ============

  // Admin: Get all tickets
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
  ) {
    return this.ticketsService.findAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
      priority,
      search,
    });
  }

  // Admin: Get single ticket
  @Get('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findOneAdmin(@Param('id') id: string) {
    return this.ticketsService.findOneAdmin(id);
  }

  // Admin: Reply to ticket
  @Post('admin/:id/reply')
  @UseGuards(RolesGuard)
  @Roles('admin')
  adminReply(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: ReplyTicketDto,
  ) {
    const adminId = req.user.userId || req.user.id;
    return this.ticketsService.adminReply(id, adminId, dto);
  }

  // Admin: Close ticket
  @Patch('admin/:id/close')
  @UseGuards(RolesGuard)
  @Roles('admin')
  adminClose(@Param('id') id: string) {
    return this.ticketsService.adminClose(id);
  }

  // Admin: Change status
  @Patch('admin/:id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.ticketsService.changeStatus(id, status);
  }
}
