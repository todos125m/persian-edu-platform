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
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import * as path from 'path';
import * as fs from 'fs';

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

  // User: Get my courses (must be before :id routes)
  @Get('me/courses')
  getMyCourses(@Request() req: any) {
    return this.usersService.getUserCourses(req.user.id);
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

  // User: Upload avatar
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('فقط فایل‌های JPG، PNG و WebP مجاز هستند'), false);
        }
      },
    }),
  )
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('فایلی انتخاب نشده است');
    }

    const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${req.user.id}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    const avatarUrl = `/uploads/avatars/${filename}`;

    await this.usersService.update(req.user.id, { avatar: avatarUrl });

    return { avatar: avatarUrl, message: 'آواتار با موفقیت آپلود شد' };
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
}
