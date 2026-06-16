import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('این ایمیل قبلاً ثبت شده است');
    }

    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (existingPhone) {
      throw new ConflictException('این شماره موبایل قبلاً ثبت شده است');
    }

    const userRole = await this.prisma.role.findUnique({
      where: { name: 'user' },
    });

    if (!userRole) {
      throw new BadRequestException('خطای سیستمی: نقش کاربر یافت نشد');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        grade: dto.grade || null,
        roleId: userRole.id,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        grade: true,
        role: {
          select: { name: true, nameFA: true },
        },
      },
    });

    const accessToken = this.generateToken(user.id, user.role.name);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      message: 'ثبت‌نام با موفقیت انجام شد',
      user,
      token: accessToken,
      refreshToken,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        role: {
          select: { name: true, nameFA: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('حساب کاربری شما غیرفعال شده است');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
    }

    const accessToken = this.generateToken(user.id, user.role.name);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      message: 'ورود موفقیت‌آمیز',
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        grade: user.grade,
        role: user.role,
      },
      token: accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        grade: true,
        isVerified: true,
        role: {
          select: { name: true, nameFA: true },
        },
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    return user;
  }

  // ========= Forgot Password =========

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'اگر ایمیل در سیستم ثبت شده باشد، لینک بازیابی ارسال خواهد شد' };
    }

    // Invalidate old tokens
    await this.prisma.passwordReset.updateMany({
      where: { userId: user.id, isUsed: false },
      data: { isUsed: true },
    });

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

    await this.prisma.passwordReset.create({
      data: { token, userId: user.id, expiresAt },
    });

    // TODO: Send email with reset link when email service is ready
    // For now, log to console in development
    console.log(`[DEV] Password reset token for ${email}: ${token}`);

    return { message: 'اگر ایمیل در سیستم ثبت شده باشد، لینک بازیابی ارسال خواهد شد' };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord || resetRecord.isUsed) {
      throw new BadRequestException('لینک بازیابی نامعتبر یا منقضی شده است');
    }

    if (resetRecord.expiresAt < new Date()) {
      throw new BadRequestException('لینک بازیابی منقضی شده است');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('رمز عبور جدید باید حداقل ۸ کاراکتر باشد');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { isUsed: true },
      }),
    ]);

    return { message: 'رمز عبور با موفقیت تغییر کرد' };
  }

  // ========= OTP & Phone-based forgot password =========

  async sendOtp(phone: string, type: 'VERIFY' | 'FORGOT_PASSWORD') {
    // Invalidate old OTPs for this phone+type
    await this.prisma.otp.updateMany({
      where: { phone, type, isUsed: false },
      data: { isUsed: true },
    });

    // Generate 5-digit code
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 3); // 3 minutes

    await this.prisma.otp.create({
      data: { phone, code, type, expiresAt },
    });

    // TODO: Send SMS via panel (Kavenegar, Ghasedak, etc.)
    console.log(`[DEV] OTP for ${phone} (${type}): ${code}`);

    return { message: 'کد تایید ارسال شد', expiresInSeconds: 180 };
  }

  async verifyOtp(phone: string, code: string, type: string) {
    const otp = await this.prisma.otp.findFirst({
      where: {
        phone,
        type: type as any,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException('کد تایید نامعتبر یا منقضی شده است');
    }

    if (otp.attempts >= 5) {
      throw new BadRequestException('تعداد تلاش‌ها بیش از حد مجاز. لطفا کد جدید درخواست کنید');
    }

    if (otp.code !== code) {
      await this.prisma.otp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('کد تایید اشتباه است');
    }

    // For FORGOT_PASSWORD, don't consume the OTP here - it will be consumed by resetPasswordByPhone
    if (type !== 'FORGOT_PASSWORD') {
      await this.prisma.otp.update({
        where: { id: otp.id },
        data: { isUsed: true },
      });
    }

    if (type === 'VERIFY') {
      await this.prisma.user.updateMany({
        where: { phone },
        data: { isVerified: true },
      });
    }

    return { message: 'کد تایید صحیح است', verified: true };
  }

  async forgotPasswordByPhone(phone: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return { message: 'اگر شماره در سیستم ثبت شده باشد، کد بازیابی ارسال خواهد شد' };
    }

    return this.sendOtp(phone, 'FORGOT_PASSWORD');
  }

  async resetPasswordByPhone(phone: string, code: string, newPassword: string) {
    const otp = await this.prisma.otp.findFirst({
      where: {
        phone,
        type: 'FORGOT_PASSWORD',
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp || otp.code !== code) {
      throw new BadRequestException('کد تایید نامعتبر یا منقضی شده است');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('رمز عبور جدید باید حداقل ۸ کاراکتر باشد');
    }

    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      throw new BadRequestException('کاربر یافت نشد');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      this.prisma.otp.update({
        where: { id: otp.id },
        data: { isUsed: true },
      }),
    ]);

    return { message: 'رمز عبور با موفقیت تغییر کرد' };
  }

  // ========= Token helpers =========

  private generateToken(userId: string, role: string): string {
    return this.jwtService.sign(
      { sub: userId, role },
      { expiresIn: '15m' },
    );
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });

    return token;
  }

  async refreshTokens(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: { role: { select: { name: true } } },
        },
      },
    });

    if (!tokenRecord || tokenRecord.isRevoked) {
      throw new UnauthorizedException('توکن نامعتبر است');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('توکن منقضی شده است');
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { isRevoked: true },
    });

    const newAccessToken = this.generateToken(tokenRecord.userId, tokenRecord.user.role.name);
    const newRefreshToken = await this.generateRefreshToken(tokenRecord.userId);

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('کاربر یافت نشد');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('رمز عبور فعلی اشتباه است');
    }

    if (newPassword.length < 8) {
      throw new BadRequestException('رمز عبور جدید باید حداقل ۸ کاراکتر باشد');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'رمز عبور با موفقیت تغییر کرد' };
  }

  async revokeRefreshToken(token: string) {
    await this.prisma.refreshToken.updateMany({
      where: { token, isRevoked: false },
      data: { isRevoked: true },
    });
  }
}
