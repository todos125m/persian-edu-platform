import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateSectionDto {
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
