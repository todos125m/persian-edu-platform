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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from './videos.service';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('videos')
export class VideosController {
  constructor(
    private videosService: VideosService,
    private storageService: StorageService,
  ) {}

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

  // Check storage mode
  @Get('storage-mode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getStorageMode() {
    return { mode: this.storageService.isLocalStorage() ? 'local' : 's3' };
  }

  // Get upload URL (S3 mode)
  @Post('upload-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getUploadUrl(
    @Body('lessonId') lessonId: string,
    @Body('filename') filename: string,
  ) {
    return this.videosService.getUploadUrl(lessonId, filename);
  }

  // Upload file directly (local mode)
  @Post('upload-local')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('video', {
      limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
    }),
  )
  uploadLocal(
    @UploadedFile() file: Express.Multer.File,
    @Body('lessonId') lessonId: string,
    @Body('duration') duration: string,
  ) {
    return this.videosService.uploadLocal(
      lessonId,
      file,
      parseInt(duration) || 0,
    );
  }

  // Confirm upload complete (S3 mode)
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
