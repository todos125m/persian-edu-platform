import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import jalaali from 'jalaali-js';

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price in Toman
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
}

// Format duration (minutes or seconds to readable)
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${totalSeconds} ثانیه`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Format duration for display (minutes to hours)
export function formatCourseDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} دقیقه`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours} ساعت`;
  }

  return `${hours} ساعت و ${mins} دقیقه`;
}

// Convert Gregorian to Jalali
export function toJalali(date: Date | string): string {
  const d = new Date(date);
  const { jy, jm, jd } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return `${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')}`;
}

// Format relative time in Persian
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) {
    return 'همین الان';
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} دقیقه پیش`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} ساعت پیش`;
  } else if (diff < 2592000) {
    const days = Math.floor(diff / 86400);
    return `${days} روز پیش`;
  } else {
    return toJalali(date);
  }
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

// Validate email
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate Iranian phone number
export function isValidPhone(phone: string): boolean {
  const re = /^09[0-9]{9}$/;
  return re.test(phone);
}

// Generate random color
export function getRandomColor(): string {
  const colors = [
    'bg-red-100 text-red-700',
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-yellow-100 text-yellow-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Convert number to Persian digits
export function toPersianNumber(num: number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

// Format total duration (seconds to readable Persian)
export function formatTotalDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${toPersianNumber(hours)} ساعت و ${toPersianNumber(minutes)} دقیقه`;
  }
  return `${toPersianNumber(minutes)} دقیقه`;
}

// Slug generator
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
