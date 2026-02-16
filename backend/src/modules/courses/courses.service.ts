import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseStatus } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // Public: Get published courses
  async findPublished(params: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    search?: string;
  }) {
    const { page = 1, limit = 12, category, level, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      status: CourseStatus.PUBLISHED,
      deletedAt: null,
    };

    if (category) {
      where.category = { slug: category };
    }

    if (level) {
      where.level = level;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          shortDesc: true,
          thumbnail: true,
          price: true,
          discountPrice: true,
          discountExpiry: true,
          duration: true,
          lessonsCount: true,
          studentsCount: true,
          level: true,
          isFeatured: true,
          category: {
            select: { name: true, nameFA: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: courses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Public: Get featured courses
  async findFeatured() {
    return this.prisma.course.findMany({
      where: {
        status: CourseStatus.PUBLISHED,
        isFeatured: true,
        deletedAt: null,
      },
      take: 8,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDesc: true,
        thumbnail: true,
        price: true,
        discountPrice: true,
        duration: true,
        lessonsCount: true,
        studentsCount: true,
        level: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Public: Get single course by slug
  async findBySlug(slug: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        slug,
        status: CourseStatus.PUBLISHED,
        deletedAt: null,
      },
      include: {
        category: {
          select: { name: true, nameFA: true, slug: true },
        },
        lessons: {
          where: { isPublished: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            sortOrder: true,
            isFree: true,
            video: {
              select: { duration: true },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('دوره یافت نشد');
    }

    return course;
  }

  // Admin: Get all courses
  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    status?: string,
    category?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.categoryId = category;
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          price: true,
          status: true,
          lessonsCount: true,
          studentsCount: true,
          isFeatured: true,
          category: {
            select: { nameFA: true },
          },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: courses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Admin: Create course
  async create(dto: CreateCourseDto) {
    // Check slug uniqueness
    const existing = await this.prisma.course.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('این آدرس (slug) قبلاً استفاده شده است');
    }

    return this.prisma.course.create({
      data: dto,
      include: {
        category: {
          select: { nameFA: true },
        },
      },
    });
  }

  // Admin: Update course
  async update(id: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
    });

    if (!course) {
      throw new NotFoundException('دوره یافت نشد');
    }

    // Check slug uniqueness if changing
    if (dto.slug && dto.slug !== course.slug) {
      const existing = await this.prisma.course.findUnique({
        where: { slug: dto.slug },
      });

      if (existing) {
        throw new ConflictException('این آدرس (slug) قبلاً استفاده شده است');
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: dto,
    });
  }

  // Admin: Delete course
  async remove(id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
    });

    if (!course) {
      throw new NotFoundException('دوره یافت نشد');
    }

    await this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'دوره با موفقیت حذف شد' };
  }

  // Admin: Toggle featured
  async toggleFeatured(id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
    });

    if (!course) {
      throw new NotFoundException('دوره یافت نشد');
    }

    return this.prisma.course.update({
      where: { id },
      data: { isFeatured: !course.isFeatured },
    });
  }

  // Increment students count
  async incrementStudents(courseId: string) {
    await this.prisma.course.update({
      where: { id: courseId },
      data: { studentsCount: { increment: 1 } },
    });
  }
}
