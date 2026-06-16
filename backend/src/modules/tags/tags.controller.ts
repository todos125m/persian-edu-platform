import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('tags')
export class TagsController {
  constructor(private tagsService: TagsService) {}

  // Public: Get all tags
  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  // Public: Get popular tags (top 20)
  @Get('popular')
  findPopular() {
    return this.tagsService.findPopular();
  }

  // ============ Admin Routes ============

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }

  @Post('admin/course/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  assignTags(@Param('courseId') courseId: string, @Body('tagIds') tagIds: string[]) {
    return this.tagsService.assignTagsToCourse(courseId, tagIds);
  }
}
