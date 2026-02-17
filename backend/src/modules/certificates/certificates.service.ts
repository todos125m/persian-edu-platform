import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  // User: Get my certificates
  async findUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      include: {
        course: { select: { title: true, slug: true, thumbnail: true } },
      },
    });
  }

  // User: Request certificate for completed course
  async issue(userId: string, courseId: string) {
    // Check enrollment exists
    const enrollment = await this.prisma.userCourse.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrollment) throw new BadRequestException('شما در این دوره ثبت‌نام نکرده‌اید');
    if (enrollment.progress < 100) {
      throw new BadRequestException('ابتدا باید دوره را به طور کامل مشاهده کنید');
    }

    // Check duplicate
    const existing = await this.prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return existing;

    const certificateNo = this.generateCertificateNo();

    return this.prisma.certificate.create({
      data: { userId, courseId, certificateNo },
      include: {
        course: { select: { title: true, slug: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    });
  }

  // Public: Verify certificate
  async verify(certificateNo: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { certificateNo },
      include: {
        user: { select: { firstName: true, lastName: true } },
        course: { select: { title: true } },
      },
    });
    if (!cert) throw new NotFoundException('گواهینامه یافت نشد');
    return cert;
  }

  // Admin: Get all certificates
  async adminFindAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [certs, total] = await Promise.all([
      this.prisma.certificate.findMany({
        skip,
        take: limit,
        orderBy: { issuedAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          course: { select: { title: true } },
        },
      }),
      this.prisma.certificate.count(),
    ]);

    return {
      data: certs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private generateCertificateNo(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `CERT-${timestamp}-${random}`;
  }
}
