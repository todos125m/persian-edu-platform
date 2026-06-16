import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('sections')
export class SectionsController {
  constructor(private sectionsService: SectionsService) {}

  // Public: Get all sections for a course (with lessons)
  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.sectionsService.findByCourse(courseId);
  }

  // ============ Admin Routes ============

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateSectionDto) {
    return this.sectionsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
    return this.sectionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }

  @Post('course/:courseId/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  reorder(@Param('courseId') courseId: string, @Body('sectionIds') sectionIds: string[]) {
    return this.sectionsService.reorder(courseId, sectionIds);
  }
}
