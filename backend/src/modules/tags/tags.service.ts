import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  // Public: Get all tags
  async findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });
  }

  // Public: Get top 20 tags by usage count
  async findPopular() {
    const tags = await this.prisma.tag.findMany({
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    // Sort by course count descending, take top 20
    return tags
      .sort((a, b) => b._count.courses - a._count.courses)
      .slice(0, 20);
  }

  // Admin: Create tag
  async create(dto: CreateTagDto) {
    const slug = dto.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');

    const existing = await this.prisma.tag.findFirst({
      where: {
        OR: [{ name: dto.name }, { slug }],
      },
    });

    if (existing) {
      throw new ConflictException('این تگ قبلاً ایجاد شده است');
    }

    return this.prisma.tag.create({
      data: {
        name: dto.name,
        slug,
      },
    });
  }

  // Admin: Delete tag
  async remove(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('تگ یافت نشد');
    }

    // Delete all course-tag relations first
    await this.prisma.courseTag.deleteMany({
      where: { tagId: id },
    });

    await this.prisma.tag.delete({
      where: { id },
    });

    return { message: 'تگ با موفقیت حذف شد' };
  }

  // Admin: Assign tags to a course
  async assignTagsToCourse(courseId: string, tagIds: string[]) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('دوره یافت نشد');
    }

    // Remove all existing tags for this course
    await this.prisma.courseTag.deleteMany({
      where: { courseId },
    });

    // Create new tag assignments
    if (tagIds.length > 0) {
      const data = tagIds.map((tagId) => ({
        courseId,
        tagId,
      }));

      await this.prisma.courseTag.createMany({
        data,
        skipDuplicates: true,
      });
    }

    // Return updated course with tags
    return this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }
}
