import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { StorageService } from './storage.service';
import { TranscodingService } from './transcoding.service';

@Module({
  controllers: [VideosController],
  providers: [VideosService, StorageService, TranscodingService],
  exports: [VideosService, StorageService, TranscodingService],
})
export class VideosModule {}
