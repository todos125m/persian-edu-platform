import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('videos')
export class VideosController {
  constructor(private videosService: VideosService) {}

  // ============ User Routes ============

  // Get stream URL (with ownership check)
  @Get(':id/stream')
  @UseGuards(JwtAuthGuard)
  getStreamUrl(@Param('id') id: string, @Request() req: any) {
    return this.videosService.getStreamUrl(id, req.user.id);
  }

  // Update watch progress
  @Patch(':id/progress')
  @UseGuards(JwtAuthGuard)
  updateProgress(
    @Param('id') id: string,
    @Request() req: any,
    @Body('position') position: number,
    @Body('completed') completed?: boolean,
  ) {
    return this.videosService.updateProgress(id, req.user.id, position, completed);
  }

  // ============ Admin Routes ============

  // Get upload URL
  @Post('upload-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getUploadUrl(
    @Body('lessonId') lessonId: string,
    @Body('filename') filename: string,
  ) {
    return this.videosService.getUploadUrl(lessonId, filename);
  }

  // Confirm upload complete
  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  confirmUpload(
    @Param('id') id: string,
    @Body('duration') duration: number,
  ) {
    return this.videosService.confirmUpload(id, duration);
  }

  // Delete video
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.videosService.remove(id);
  }
}
