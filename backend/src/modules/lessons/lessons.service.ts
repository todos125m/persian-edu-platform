import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

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
