import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'فرمت ایمیل صحیح نیست' })
  email: string;

  @IsString({ message: 'رمز عبور الزامی است' })
  @MinLength(1, { message: 'رمز عبور الزامی است' })
  password: string;
}
