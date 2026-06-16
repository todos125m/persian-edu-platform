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
import { TranscodingService } from './transcoding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('videos')
export class VideosController {
  constructor(
    private videosService: VideosService,
    private storageService: StorageService,
    private transcodingService: TranscodingService,
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

  // ============ Admin/Instructor Routes ============

  // Check storage mode
  @Get('storage-mode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  getStorageMode() {
    return { mode: this.storageService.isLocalStorage() ? 'local' : 's3' };
  }

  // Get upload URL (S3 mode)
  @Post('upload-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  getUploadUrl(
    @Body('lessonId') lessonId: string,
    @Body('filename') filename: string,
  ) {
    return this.videosService.getUploadUrl(lessonId, filename);
  }

  // Upload file directly (local mode)
  @Post('upload-local')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
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
  @Roles('admin', 'instructor')
  confirmUpload(
    @Param('id') id: string,
    @Body('duration') duration: number,
    @Body('transcode') transcode?: boolean,
  ) {
    return this.videosService.confirmUpload(id, duration, transcode);
  }

  // Start transcoding for an existing video
  @Post(':id/transcode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  startTranscoding(@Param('id') id: string) {
    return this.videosService.startTranscoding(id);
  }

  // Get transcoding status
  @Get(':id/transcode-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  getTranscodingStatus(@Param('id') id: string) {
    return this.transcodingService.getTranscodingStatus(id);
  }

  // Delete video
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'instructor')
  remove(@Param('id') id: string) {
    return this.videosService.remove(id);
  }
}
