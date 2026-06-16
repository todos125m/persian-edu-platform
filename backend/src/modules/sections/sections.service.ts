import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  // Public: Get all sections for a course (with lessons)
  async findByCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('دوره یافت نشد');
    }

    return this.prisma.section.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
      include: {
        lessons: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            sortOrder: true,
            isFree: true,
            isPublished: true,
            video: {
              select: { id: true, duration: true, status: true },
            },
          },
        },
      },
    });
  }

  // Admin: Create section
  async create(dto: CreateSectionDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('دوره یافت نشد');
    }

    // Get max sort order for auto-ordering
    const maxOrder = await this.prisma.section.findFirst({
      where: { courseId: dto.courseId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    return this.prisma.section.create({
      data: {
        ...dto,
        sortOrder: (maxOrder?.sortOrder ?? 0) + 1,
      },
    });
  }

  // Admin: Update section
  async update(id: string, dto: UpdateSectionDto) {
    const section = await this.prisma.section.findUnique({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException('بخش یافت نشد');
    }

    return this.prisma.section.update({
      where: { id },
      data: dto,
    });
  }

  // Admin: Delete section
  async remove(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
    });

    if (!section) {
      throw new NotFoundException('بخش یافت نشد');
    }

    // Unlink lessons from this section before deleting
    if (section._count.lessons > 0) {
      await this.prisma.lesson.updateMany({
        where: { sectionId: id },
        data: { sectionId: null },
      });
    }

    await this.prisma.section.delete({
      where: { id },
    });

    return { message: 'بخش با موفقیت حذف شد' };
  }

  // Admin: Reorder sections
  async reorder(courseId: string, sectionIds: string[]) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('دوره یافت نشد');
    }

    const updates = sectionIds.map((id, index) =>
      this.prisma.section.update({
        where: { id },
        data: { sortOrder: index + 1 },
      }),
    );

    await this.prisma.$transaction(updates);

    return { message: 'ترتیب بخش‌ها با موفقیت تغییر کرد' };
  }
}
