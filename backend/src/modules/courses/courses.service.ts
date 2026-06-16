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
          viewCount: true,
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
    const featured = await this.prisma.course.findMany({
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
        category: {
          select: { name: true, nameFA: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If no featured courses, return latest published courses
    if (featured.length === 0) {
      return this.prisma.course.findMany({
        where: {
          status: CourseStatus.PUBLISHED,
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
          category: {
            select: { name: true, nameFA: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return featured;
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

  // Track course view
  async trackView(courseId: string, userId?: string, ip?: string) {
    // Dedup: don't count same user/ip within 30 minutes
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const where: any = {
      courseId,
      viewedAt: { gte: thirtyMinAgo },
    };
    if (userId) {
      where.userId = userId;
    } else if (ip) {
      where.ip = ip;
    } else {
      // No dedup possible, just record
      where.id = 'none'; // won't match anything
    }

    const recent = await this.prisma.courseView.findFirst({ where });
    if (recent) return; // Already counted recently

    await Promise.all([
      this.prisma.courseView.create({
        data: { courseId, userId: userId || null, ip: ip || null },
      }),
      this.prisma.course.update({
        where: { id: courseId },
        data: { viewCount: { increment: 1 } },
      }),
    ]);
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
          viewCount: true,
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

  // Admin: Get single course by ID
  async findOneAdmin(id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: {
          select: { id: true, nameFA: true, slug: true },
        },
        lessons: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
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

    if (!course) {
      throw new NotFoundException('دوره یافت نشد');
    }

    return course;
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
