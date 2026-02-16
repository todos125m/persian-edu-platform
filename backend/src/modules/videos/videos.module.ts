import { Module } from '@nestjs/common';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { StorageService } from './storage.service';

@Module({
  controllers: [VideosController],
  providers: [VideosService, StorageService],
  exports: [VideosService, StorageService],
})
export class VideosModule {}
