import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../videos/storage.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  // Get lessons for a course
  async findByCourse(courseId: string) {
    return this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
      include: {
        video: {
          select: { id: true, duration: true, status: true },
        },
      },
    });
  }

  // Get single lesson (check ownership for paid content)
  async findOne(lessonId: string, userId?: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: { id: true, title: true },
        },
        video: {
          select: {
            id: true,
            duration: true,
            status: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('درس یافت نشد');
    }

    // If lesson is free, return it
    if (lesson.isFree) {
      return lesson;
    }

    // If not free, check if user has access
    if (!userId) {
      throw new ForbiddenException('برای مشاهده این درس باید دوره را خریداری کنید');
    }

    const hasAccess = await this.prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.course.id,
        },
      },
    });

    if (!hasAccess) {
      throw new ForbiddenException('برای مشاهده این درس باید دوره را خریداری کنید');
    }

    // Check if access is locked due to unpaid installments
    if (hasAccess.isLocked) {
      throw new ForbiddenException('دسترسی شما به دلیل عدم پرداخت قسط قفل شده است. لطفاً اقساط معوق را پرداخت کنید.');
    }

    return lesson;
  }

  // Admin: Create lesson
  async create(dto: CreateLessonDto) {
    // Get max sort order
    const maxOrder = await this.prisma.lesson.findFirst({
      where: { courseId: dto.courseId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const lesson = await this.prisma.lesson.create({
      data: {
        ...dto,
        sortOrder: dto.sortOrder ?? (maxOrder?.sortOrder ?? 0) + 1,
      },
    });

    // Update course lessons count
    await this.updateCourseLessonsCount(dto.courseId);

    return lesson;
  }

  // Admin: Update lesson
  async update(id: string, dto: UpdateLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException('درس یافت نشد');
    }

    return this.prisma.lesson.update({
      where: { id },
      data: dto,
    });
  }

  // Admin: Delete lesson
  async remove(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException('درس یافت نشد');
    }

    await this.prisma.lesson.delete({
      where: { id },
    });

    // Update course lessons count
    await this.updateCourseLessonsCount(lesson.courseId);

    return { message: 'درس با موفقیت حذف شد' };
  }

  // Admin: Reorder lessons
  async reorder(courseId: string, lessonIds: string[]) {
    const updates = lessonIds.map((id, index) =>
      this.prisma.lesson.update({
        where: { id },
        data: { sortOrder: index + 1 },
      }),
    );

    await this.prisma.$transaction(updates);

    return { message: 'ترتیب درس‌ها با موفقیت تغییر کرد' };
  }

  // ============ PDF Methods ============

  // Upload PDF for a lesson
  async uploadPdf(lessonId: string, file: Express.Multer.File) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('درس یافت نشد');
    }

    if (!file) {
      throw new BadRequestException('فایلی ارسال نشده');
    }

    // Delete old PDF if exists
    if (lesson.pdfUrl) {
      try {
        await this.storageService.deleteVideo(lesson.pdfUrl);
      } catch {
        // Ignore deletion errors for old file
      }
    }

    // Upload new PDF
    const storageKey = `pdfs/${uuid()}.pdf`;
    await this.storageService.uploadFile(storageKey, file.buffer, 'application/pdf');

    // Update lesson record
    const updated = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        pdfUrl: storageKey,
        pdfName: file.originalname,
      },
    });

    return {
      message: 'فایل PDF با موفقیت آپلود شد',
      pdfName: updated.pdfName,
      pdfUrl: updated.pdfUrl,
    };
  }

  // Delete PDF from a lesson
  async deletePdf(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('درس یافت نشد');
    }

    if (!lesson.pdfUrl) {
      throw new BadRequestException('این درس فایل PDF ندارد');
    }

    // Delete from storage
    try {
      await this.storageService.deleteVideo(lesson.pdfUrl);
    } catch {
      // Ignore storage deletion errors
    }

    // Clear lesson record
    await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        pdfUrl: null,
        pdfName: null,
      },
    });

    return { message: 'فایل PDF با موفقیت حذف شد' };
  }

  // Get PDF download URL (with access check)
  async getPdfUrl(lessonId: string, userId?: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: { select: { id: true } },
      },
    });

    if (!lesson) {
      throw new NotFoundException('درس یافت نشد');
    }

    if (!lesson.pdfUrl) {
      throw new NotFoundException('این درس فایل PDF ندارد');
    }

    // Access check: free lesson or user has course
    if (!lesson.isFree) {
      if (!userId) {
        throw new ForbiddenException('برای دانلود جزوه باید وارد شوید');
      }

      const hasAccess = await this.prisma.userCourse.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: lesson.course.id,
          },
        },
      });

      if (!hasAccess) {
        throw new ForbiddenException('برای دانلود جزوه باید دوره را خریداری کنید');
      }

      // Check if access is locked due to unpaid installments
      if (hasAccess.isLocked) {
        throw new ForbiddenException('دسترسی شما به دلیل عدم پرداخت قسط قفل شده است. لطفاً اقساط معوق را پرداخت کنید.');
      }
    }

    const url = await this.storageService.getStreamUrl(lesson.pdfUrl, 3600);
    return { url, name: lesson.pdfName };
  }

  // Helper: Update course lessons count
  private async updateCourseLessonsCount(courseId: string) {
    const count = await this.prisma.lesson.count({
      where: { courseId, isPublished: true },
    });

    await this.prisma.course.update({
      where: { id: courseId },
      data: { lessonsCount: count },
    });
  }
}
