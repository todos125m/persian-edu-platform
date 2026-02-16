import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Admin: Get all roles
  @Get('roles')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getRoles() {
    return this.usersService.getRoles();
  }

  // Admin: Get all users
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.usersService.findAll(+page, +limit, search, role);
  }

  // Admin: Get single user
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // User: Update own profile
  @Patch('profile')
  updateProfile(@Request() req: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.id, dto);
  }

  // Admin: Change user role
  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles('admin')
  changeRole(@Param('id') id: string, @Body('roleId') roleId: string) {
    return this.usersService.changeRole(id, roleId);
  }

  // Admin: Update any user
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // Admin: Toggle user active status
  @Patch(':id/toggle-active')
  @UseGuards(RolesGuard)
  @Roles('admin')
  toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }

  // Admin: Delete user
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // User: Get my courses
  @Get('me/courses')
  getMyCourses(@Request() req: any) {
    return this.usersService.getUserCourses(req.user.id);
  }
}
