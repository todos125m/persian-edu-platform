import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'فرمت ایمیل صحیح نیست' })
  email: string;

  @IsOptional()
  @Matches(/^09[0-9]{9}$/, { message: 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود' })
  phone?: string;

  @IsString({ message: 'رمز عبور الزامی است' })
  @MinLength(8, { message: 'رمز عبور باید حداقل ۸ کاراکتر باشد' })
  @MaxLength(50, { message: 'رمز عبور نمی‌تواند بیشتر از ۵۰ کاراکتر باشد' })
  password: string;

  @IsString({ message: 'نام الزامی است' })
  @MinLength(2, { message: 'نام باید حداقل ۲ کاراکتر باشد' })
  @MaxLength(50, { message: 'نام نمی‌تواند بیشتر از ۵۰ کاراکتر باشد' })
  firstName: string;

  @IsString({ message: 'نام خانوادگی الزامی است' })
  @MinLength(2, { message: 'نام خانوادگی باید حداقل ۲ کاراکتر باشد' })
  @MaxLength(50, { message: 'نام خانوادگی نمی‌تواند بیشتر از ۵۰ کاراکتر باشد' })
  lastName: string;
}
