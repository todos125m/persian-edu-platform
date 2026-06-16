import { Module } from '@nestjs/common';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { StorageService } from '../videos/storage.service';

@Module({
  controllers: [InstructorController],
  providers: [InstructorService, StorageService],
})
export class InstructorModule {}
