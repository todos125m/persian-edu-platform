import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InstructorService } from './instructor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('instructor', 'admin')
export class InstructorController {
  constructor(private instructorService: InstructorService) {}

  @Get('dashboard')
  getDashboard(@Request() req: any) {
    const instructorId = req.user.userId || req.user.id;
    return this.instructorService.getDashboard(instructorId);
  }

  @Get('courses')
  getCourses(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const instructorId = req.user.userId || req.user.id;
    return this.instructorService.getCourses(instructorId, +page, +limit);
  }

  @Get('courses/:id')
  getCourse(@Request() req: any, @Param('id') courseId: string) {
    const instructorId = req.user.userId || req.user.id;
    return this.instructorService.getCourse(courseId, instructorId);
  }

  @Post('courses')
  createCourse(@Request() req: any, @Body() body: any) {
    const instructorId = req.user.userId || req.user.id;
    return this.instructorService.createCourse(instructorId, body);
  }

  @Patch('courses/:id')
  updateCourse(
    @Request() req: any,
    @Param('id') courseId: string,
    @Body() body: any,
  ) {
    const instructorId = req.user.userId || req.user.id;
    return this.instructorService.updateCourse(courseId, instructorId, body);
  }

  @Delete('courses/:id')
  deleteCourse(@Request() req: any, @Param('id') courseId: string) {
    const instructorId = req.user.userId || req.user.id;
    return this.instructorService.deleteCourse(courseId, instructorId);
  }

  @Get('courses/:id/lessons')
  getCourseLessons(@Request() req: any, @Param('id') courseId: string) {
    const instructorId = req.user.userId || req.user.id;
    return this.instructorService.getCourseLessons(courseId, instructorId);
  }

  @Post('courses/:id/lessons')
  createLesson(
    @Request() req: any,
    @Param('id') courseId: string,
    @Body() body: any,
  ) {
    const instructorId = req.user.userId || req.user.id;
    return this.instructorService.createLesson(courseId, instructorId, body);
  }

  @Patch('lessons/:id')
  updateLesson(
    @Request() req: any,
    @Param('id') lessonId: string,
    @Body() body: any,
  ) {
    const instructorId = req.user.userId || req.user.id;
    return this.instructorService.updateLesson(lessonId, instructorId, body);
  }

  @Delete('lessons/:id')
  deleteLesson(@Request() req: any, @Param('id') lessonId: string) {
    const instructorId = req.user.userId || req.user.id;
    return this.instructorService.deleteLesson(lessonId, instructorId);
  }

  @Get('revenue')
  getRevenue(@Request() req: any) {
    const instructorId = req.user.userId || req.user.id;
    return this.instructorService.getRevenue(instructorId);
  }

  @Post('courses/:id/thumbnail')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('فقط فایل تصویری مجاز است'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  uploadThumbnail(
    @Request() req: any,
    @Param('id') courseId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const instructorId = req.user.userId || req.user.id;
    return this.instructorService.uploadThumbnail(courseId, instructorId, file);
  }
}
