import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from './storage.service';
import { VideoStatus } from '@prisma/client';

@Injectable()
export class VideosService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  // Admin: Get upload URL
  async getUploadUrl(lessonId: string, filename: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('درس یافت نشد');
    }

    // Check if lesson already has a video
    const existingVideo = await this.prisma.video.findUnique({
      where: { lessonId },
    });

    if (existingVideo) {
      throw new BadRequestException('این درس قبلاً ویدیو دارد. ابتدا ویدیو قبلی را حذف کنید');
    }

    const storageKey = this.storage.generateStorageKey(filename);
    const uploadUrl = await this.storage.getUploadUrl(storageKey, 'video/mp4');

    // Create video record (processing status)
    const video = await this.prisma.video.create({
      data: {
        filename: storageKey.split('/').pop()!,
        originalName: filename,
        storagePath: storageKey,
        storageKey,
        lessonId,
        status: VideoStatus.PROCESSING,
      },
    });

    return {
      videoId: video.id,
      uploadUrl,
      storageKey,
    };
  }

  // Admin: Upload file locally (when S3 is not configured)
  async uploadLocal(lessonId: string, file: Express.Multer.File, duration: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('درس یافت نشد');
    }

    const existingVideo = await this.prisma.video.findUnique({
      where: { lessonId },
    });

    if (existingVideo) {
      throw new BadRequestException('این درس قبلاً ویدیو دارد. ابتدا ویدیو قبلی را حذف کنید');
    }

    const storageKey = this.storage.generateStorageKey(file.originalname);

    // Save file to local disk
    const { size } = await this.storage.saveFileLocally(storageKey, file.buffer);

    // Create video record as READY
    const video = await this.prisma.video.create({
      data: {
        filename: storageKey.split('/').pop()!,
        originalName: file.originalname,
        storagePath: storageKey,
        storageKey,
        lessonId,
        status: VideoStatus.READY,
        duration,
        size,
      },
    });

    // Update course total duration
    await this.updateCourseDuration(lesson.courseId);

    return video;
  }

  // Admin: Confirm upload complete
  async confirmUpload(videoId: string, duration: number) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        lesson: {
          select: { courseId: true },
        },
      },
    });

    if (!video) {
      throw new NotFoundException('ویدیو یافت نشد');
    }

    // Get file size from storage
    const metadata = await this.storage.getVideoMetadata(video.storageKey);

    const updated = await this.prisma.video.update({
      where: { id: videoId },
      data: {
        status: VideoStatus.READY,
        duration,
        size: metadata.ContentLength,
      },
    });

    // Update course total duration
    await this.updateCourseDuration(video.lesson.courseId);

    return updated;
  }

  // Get stream URL (with ownership check)
  async getStreamUrl(videoId: string, userId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        lesson: {
          select: {
            id: true,
            isFree: true,
            courseId: true,
            course: {
              select: { title: true },
            },
          },
        },
      },
    });

    if (!video) {
      throw new NotFoundException('ویدیو یافت نشد');
    }

    if (video.status !== VideoStatus.READY) {
      throw new BadRequestException('ویدیو هنوز آماده پخش نیست');
    }

    // If lesson is free, allow access
    if (!video.lesson.isFree) {
      // Check if user owns the course
      const ownership = await this.prisma.userCourse.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: video.lesson.courseId,
          },
        },
      });

      if (!ownership) {
        throw new ForbiddenException('برای مشاهده این ویدیو باید دوره را خریداری کنید');
      }
    }

    // Generate time-limited signed URL (2 hours)
    const streamUrl = await this.storage.getStreamUrl(video.storageKey, 7200);

    // Get or create progress
    let progress = await this.prisma.videoProgress.findUnique({
      where: {
        userId_videoId: { userId, videoId },
      },
    });

    if (!progress) {
      progress = await this.prisma.videoProgress.create({
        data: {
          userId,
          videoId,
          totalSeconds: video.duration,
        },
      });
    }

    return {
      streamUrl,
      duration: video.duration,
      lastPosition: progress.lastPosition,
      isCompleted: progress.isCompleted,
    };
  }

  // Update video progress
  async updateProgress(videoId: string, userId: string, position: number, completed = false) {
    const progress = await this.prisma.videoProgress.upsert({
      where: {
        userId_videoId: { userId, videoId },
      },
      update: {
        lastPosition: position,
        watchedSeconds: position,
        isCompleted: completed,
      },
      create: {
        userId,
        videoId,
        lastPosition: position,
        watchedSeconds: position,
        isCompleted: completed,
      },
    });

    // If completed, update course progress
    if (completed) {
      await this.updateCourseProgress(userId, videoId);
    }

    return progress;
  }

  // Admin: Delete video
  async remove(videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: {
        lesson: {
          select: { courseId: true },
        },
      },
    });

    if (!video) {
      throw new NotFoundException('ویدیو یافت نشد');
    }

    // Delete from storage
    await this.storage.deleteVideo(video.storageKey);

    // Delete from database
    await this.prisma.video.delete({
      where: { id: videoId },
    });

    // Update course duration
    await this.updateCourseDuration(video.lesson.courseId);

    return { message: 'ویدیو با موفقیت حذف شد' };
  }

  // Helper: Update course total duration
  private async updateCourseDuration(courseId: string) {
    const result = await this.prisma.video.aggregate({
      where: {
        lesson: { courseId },
        status: VideoStatus.READY,
      },
      _sum: { duration: true },
    });

    await this.prisma.course.update({
      where: { id: courseId },
      data: { duration: result._sum.duration || 0 },
    });
  }

  // Helper: Update user course progress
  private async updateCourseProgress(userId: string, videoId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      select: {
        lesson: {
          select: { courseId: true },
        },
      },
    });

    if (!video) return;

    const courseId = video.lesson.courseId;

    // Count total and completed lessons
    const totalLessons = await this.prisma.lesson.count({
      where: { courseId, isPublished: true },
    });

    const completedLessons = await this.prisma.videoProgress.count({
      where: {
        userId,
        isCompleted: true,
        video: {
          lesson: { courseId },
        },
      },
    });

    const progress = Math.round((completedLessons / totalLessons) * 100);

    await this.prisma.userCourse.update({
      where: {
        userId_courseId: { userId, courseId },
      },
      data: {
        progress,
        completedAt: progress === 100 ? new Date() : null,
      },
    });
  }
}
