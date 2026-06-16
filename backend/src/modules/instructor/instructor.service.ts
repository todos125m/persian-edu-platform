import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../videos/storage.service';
import { CourseLevel, CourseStatus } from '@prisma/client';
import { v4 as uuid } from 'uuid';

@Injectable()
export class InstructorService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  // ============================================================================
  // Helper: بررسی مالکیت دوره
  // ============================================================================

  /**
   * بررسی اینکه دوره متعلق به مدرس است
   * در صورت عدم مالکیت، خطای ForbiddenException پرتاب می‌شود
   */
  async ensureOwnership(courseId: string, instructorId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });

    if (!course) {
      throw new NotFoundException('دوره یافت نشد');
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('شما دسترسی به این دوره ندارید');
    }

    return course;
  }

  // ============================================================================
  // داشبورد مدرس
  // ============================================================================

  async getDashboard(instructorId: string) {
    // دریافت دوره‌های مدرس
    const courses = await this.prisma.course.findMany({
      where: { instructorId, deletedAt: null },
      select: {
        id: true,
        studentsCount: true,
      },
    });

    const courseIds = courses.map((c) => c.id);
    const totalCourses = courses.length;
    const totalStudents = courses.reduce((sum, c) => sum + c.studentsCount, 0);

    // محاسبه درآمد از آیتم‌های سفارش پرداخت‌شده
    let totalRevenue = 0;
    if (courseIds.length > 0) {
      const revenueResult = await this.prisma.orderItem.aggregate({
        where: {
          courseId: { in: courseIds },
          order: { status: 'PAID' },
        },
        _sum: { price: true },
      });
      totalRevenue = Number(revenueResult._sum.price || 0);
    }

    // تعداد سفارش‌های پرداخت‌شده حاوی دوره‌های مدرس
    let totalPaidOrders = 0;
    if (courseIds.length > 0) {
      totalPaidOrders = await this.prisma.order.count({
        where: {
          status: 'PAID',
          items: {
            some: {
              courseId: { in: courseIds },
            },
          },
        },
      });
    }

    return {
      totalCourses,
      totalStudents,
      totalRevenue,
      totalPaidOrders,
    };
  }

  // ============================================================================
  // مدیریت دوره‌ها
  // ============================================================================

  async getCourses(instructorId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where = {
      instructorId,
      deletedAt: null,
    };

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
          discountPrice: true,
          status: true,
          level: true,
          lessonsCount: true,
          studentsCount: true,
          duration: true,
          isFeatured: true,
          category: {
            select: { name: true, nameFA: true, slug: true },
          },
          createdAt: true,
          updatedAt: true,
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

  async getCourse(courseId: string, instructorId: string) {
    await this.ensureOwnership(courseId, instructorId);

    return this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: {
          select: { id: true, name: true, nameFA: true, slug: true },
        },
      },
    });
  }

  async createCourse(
    instructorId: string,
    data: {
      title: string;
      slug: string;
      description: string;
      shortDesc?: string;
      thumbnail?: string;
      previewVideo?: string;
      price: number;
      discountPrice?: number;
      discountExpiry?: Date;
      level?: string;
      status?: string;
      categoryId: string;
      metaTitle?: string;
      metaDescription?: string;
    },
  ) {
    // بررسی الزامی بودن دسته‌بندی
    if (!data.categoryId) {
      throw new BadRequestException('دسته‌بندی الزامی است');
    }

    // بررسی وجود دسته‌بندی
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new BadRequestException('دسته‌بندی معتبر نیست');
    }

    // بررسی یکتایی slug
    const existing = await this.prisma.course.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictException('این آدرس (slug) قبلاً استفاده شده است');
    }

    return this.prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        shortDesc: data.shortDesc,
        thumbnail: data.thumbnail,
        previewVideo: data.previewVideo,
        price: data.price,
        discountPrice: data.discountPrice,
        discountExpiry: data.discountExpiry,
        level: (data.level as CourseLevel) || CourseLevel.BEGINNER,
        status: (data.status as CourseStatus) || CourseStatus.DRAFT,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        instructorId,
        categoryId: data.categoryId,
      },
      include: {
        category: {
          select: { name: true, nameFA: true, slug: true },
        },
      },
    });
  }

  async updateCourse(
    courseId: string,
    instructorId: string,
    data: {
      title?: string;
      slug?: string;
      description?: string;
      shortDesc?: string;
      thumbnail?: string;
      previewVideo?: string;
      price?: number;
      discountPrice?: number;
      discountExpiry?: Date;
      level?: string;
      status?: string;
      categoryId?: string;
      metaTitle?: string;
      metaDescription?: string;
    },
  ) {
    const course = await this.ensureOwnership(courseId, instructorId);

    // بررسی یکتایی slug در صورت تغییر
    if (data.slug) {
      const existing = await this.prisma.course.findFirst({
        where: {
          slug: data.slug,
          id: { not: courseId },
        },
      });

      if (existing) {
        throw new ConflictException('این آدرس (slug) قبلاً استفاده شده است');
      }
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.shortDesc !== undefined) updateData.shortDesc = data.shortDesc;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.previewVideo !== undefined) updateData.previewVideo = data.previewVideo;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.discountPrice !== undefined) updateData.discountPrice = data.discountPrice;
    if (data.discountExpiry !== undefined) updateData.discountExpiry = data.discountExpiry;
    if (data.level !== undefined) updateData.level = data.level as CourseLevel;
    if (data.status !== undefined) updateData.status = data.status as CourseStatus;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;

    return this.prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: {
        category: {
          select: { name: true, nameFA: true, slug: true },
        },
      },
    });
  }

  async deleteCourse(courseId: string, instructorId: string) {
    await this.ensureOwnership(courseId, instructorId);

    // حذف نرم (soft delete)
    await this.prisma.course.update({
      where: { id: courseId },
      data: { deletedAt: new Date() },
    });

    return { message: 'دوره با موفقیت حذف شد' };
  }

  // ============================================================================
  // مدیریت درس‌ها
  // ============================================================================

  async getCourseLessons(courseId: string, instructorId: string) {
    await this.ensureOwnership(courseId, instructorId);

    return this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
      include: {
        section: {
          select: { id: true, title: true },
        },
        video: {
          select: { id: true, duration: true, status: true, originalName: true },
        },
      },
    });
  }

  async createLesson(
    courseId: string,
    instructorId: string,
    data: {
      title: string;
      description?: string;
      sortOrder?: number;
      isFree?: boolean;
      isPublished?: boolean;
      sectionId?: string;
    },
  ) {
    await this.ensureOwnership(courseId, instructorId);

    // دریافت حداکثر ترتیب فعلی
    const maxOrder = await this.prisma.lesson.findFirst({
      where: { courseId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const lesson = await this.prisma.lesson.create({
      data: {
        ...data,
        courseId,
        sortOrder: data.sortOrder ?? (maxOrder?.sortOrder ?? 0) + 1,
      },
    });

    // بروزرسانی تعداد درس‌های دوره
    await this.updateCourseLessonsCount(courseId);

    return lesson;
  }

  async updateLesson(
    lessonId: string,
    instructorId: string,
    data: {
      title?: string;
      description?: string;
      sortOrder?: number;
      isFree?: boolean;
      isPublished?: boolean;
      sectionId?: string;
    },
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, courseId: true },
    });

    if (!lesson) {
      throw new NotFoundException('درس یافت نشد');
    }

    // بررسی مالکیت دوره مربوط به درس
    await this.ensureOwnership(lesson.courseId, instructorId);

    const updated = await this.prisma.lesson.update({
      where: { id: lessonId },
      data,
    });

    // بروزرسانی تعداد درس‌های دوره در صورت تغییر وضعیت انتشار
    if (data.isPublished !== undefined) {
      await this.updateCourseLessonsCount(lesson.courseId);
    }

    return updated;
  }

  async deleteLesson(lessonId: string, instructorId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, courseId: true },
    });

    if (!lesson) {
      throw new NotFoundException('درس یافت نشد');
    }

    // بررسی مالکیت دوره مربوط به درس
    await this.ensureOwnership(lesson.courseId, instructorId);

    await this.prisma.lesson.delete({
      where: { id: lessonId },
    });

    // بروزرسانی تعداد درس‌های دوره
    await this.updateCourseLessonsCount(lesson.courseId);

    return { message: 'درس با موفقیت حذف شد' };
  }

  // ============================================================================
  // گزارش درآمد
  // ============================================================================

  async getRevenue(instructorId: string) {
    // دوره‌های مدرس
    const courses = await this.prisma.course.findMany({
      where: { instructorId, deletedAt: null },
      select: { id: true, title: true },
    });

    const courseIds = courses.map((c) => c.id);

    if (courseIds.length === 0) {
      return {
        totalRevenue: 0,
        monthlyRevenue: [],
        courseRevenue: [],
      };
    }

    // کل درآمد
    const totalResult = await this.prisma.orderItem.aggregate({
      where: {
        courseId: { in: courseIds },
        order: { status: 'PAID' },
      },
      _sum: { price: true },
    });

    const totalRevenue = Number(totalResult._sum.price || 0);

    // درآمد به تفکیک ماه (۱۲ ماه اخیر)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const paidOrderItems = await this.prisma.orderItem.findMany({
      where: {
        courseId: { in: courseIds },
        order: {
          status: 'PAID',
          createdAt: { gte: twelveMonthsAgo },
        },
      },
      select: {
        price: true,
        order: {
          select: { createdAt: true },
        },
      },
    });

    // گروه‌بندی بر اساس ماه
    const monthlyMap = new Map<string, number>();
    const persianMonths = [
      'فروردین',
      'اردیبهشت',
      'خرداد',
      'تیر',
      'مرداد',
      'شهریور',
      'مهر',
      'آبان',
      'آذر',
      'دی',
      'بهمن',
      'اسفند',
    ];

    for (const item of paidOrderItems) {
      const date = new Date(item.order.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const current = monthlyMap.get(key) || 0;
      monthlyMap.set(key, current + Number(item.price));
    }

    // ساخت آرایه ۱۲ ماه اخیر
    const monthlyRevenue: { month: string; year: number; amount: number }[] = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyRevenue.push({
        month: persianMonths[d.getMonth()] || `${d.getMonth() + 1}`,
        year: d.getFullYear(),
        amount: monthlyMap.get(key) || 0,
      });
    }

    // درآمد به تفکیک دوره
    const courseRevenueData = await this.prisma.orderItem.groupBy({
      by: ['courseId'],
      where: {
        courseId: { in: courseIds },
        order: { status: 'PAID' },
      },
      _sum: { price: true },
      _count: true,
    });

    const courseRevenue = courseRevenueData.map((item) => {
      const course = courses.find((c) => c.id === item.courseId);
      return {
        courseId: item.courseId,
        courseTitle: course?.title || '',
        totalSales: item._count,
        revenue: Number(item._sum.price || 0),
      };
    });

    // مرتب‌سازی بر اساس درآمد نزولی
    courseRevenue.sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      monthlyRevenue,
      courseRevenue,
    };
  }

  // ============================================================================
  // Helper: بروزرسانی تعداد درس‌های دوره
  // ============================================================================

  private async updateCourseLessonsCount(courseId: string) {
    const count = await this.prisma.lesson.count({
      where: { courseId, isPublished: true },
    });

    await this.prisma.course.update({
      where: { id: courseId },
      data: { lessonsCount: count },
    });
  }

  // ============================================================================
  // آپلود تصویر شاخص دوره
  // ============================================================================

  async uploadThumbnail(
    courseId: string,
    instructorId: string,
    file: Express.Multer.File,
  ) {
    await this.ensureOwnership(courseId, instructorId);

    if (!file) {
      throw new BadRequestException('فایلی ارسال نشده');
    }

    // حذف تصویر قبلی اگر در storage ذخیره شده
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { thumbnail: true },
    });

    if (course?.thumbnail && course.thumbnail.startsWith('thumbnails/')) {
      try {
        await this.storageService.deleteVideo(course.thumbnail);
      } catch {
        // Ignore deletion errors
      }
    }

    // آپلود فایل جدید
    const ext = file.originalname.split('.').pop() || 'jpg';
    const storageKey = `thumbnails/${uuid()}.${ext}`;
    await this.storageService.uploadFile(storageKey, file.buffer, file.mimetype);

    // آپدیت دوره
    const updated = await this.prisma.course.update({
      where: { id: courseId },
      data: { thumbnail: storageKey },
    });

    return {
      message: 'تصویر شاخص با موفقیت آپلود شد',
      thumbnail: updated.thumbnail,
    };
  }
}
