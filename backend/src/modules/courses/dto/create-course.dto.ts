import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsUUID,
  MinLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CourseLevel, CourseStatus } from '@prisma/client';

export class CreateCourseDto {
  @IsString()
  @MinLength(3, { message: 'عنوان باید حداقل ۳ کاراکتر باشد' })
  title: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'آدرس فقط می‌تواند شامل حروف انگلیسی کوچک، اعداد و خط تیره باشد' })
  slug: string;

  @IsString()
  @MinLength(10, { message: 'توضیحات باید حداقل ۱۰ کاراکتر باشد' })
  description: string;

  @IsOptional()
  @IsString()
  shortDesc?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  previewVideo?: string;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountPrice?: number;

  @IsOptional()
  discountExpiry?: Date;

  @IsOptional()
  @IsEnum(CourseLevel, { message: 'سطح نامعتبر است' })
  level?: CourseLevel;

  @IsOptional()
  @IsEnum(CourseStatus, { message: 'وضعیت نامعتبر است' })
  status?: CourseStatus;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsUUID('4', { message: 'شناسه دسته‌بندی نامعتبر است' })
  categoryId: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;
}
