import { IsString, IsOptional, IsBoolean, IsUUID, IsNumber, MinLength } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @MinLength(3, { message: 'عنوان باید حداقل ۳ کاراکتر باشد' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsUUID('4', { message: 'شناسه دوره نامعتبر است' })
  courseId: string;
}
