import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Public: Get all active categories (with children)
  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { courses: true },
        },
      },
    });
  }

  // Public: Get category by slug
  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          where: { isActive: true },
        },
        parent: true,
      },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }

    return category;
  }

  // Admin: Get all categories (including inactive)
  async findAllAdmin() {
    return this.prisma.category.findMany({
      orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
      include: {
        parent: {
          select: { nameFA: true },
        },
        _count: {
          select: { courses: true },
        },
      },
    });
  }

  // Admin: Create category
  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('این آدرس قبلاً استفاده شده است');
    }

    return this.prisma.category.create({
      data: dto,
    });
  }

  // Admin: Update category
  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: dto.slug },
      });

      if (existing) {
        throw new ConflictException('این آدرس قبلاً استفاده شده است');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  // Admin: Delete category
  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true, children: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('دسته‌بندی یافت نشد');
    }

    if (category._count.courses > 0) {
      throw new ConflictException('این دسته‌بندی دارای دوره است و نمی‌توان آن را حذف کرد');
    }

    if (category._count.children > 0) {
      throw new ConflictException('این دسته‌بندی دارای زیردسته است و نمی‌توان آن را حذف کرد');
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'دسته‌بندی با موفقیت حذف شد' };
  }
}
