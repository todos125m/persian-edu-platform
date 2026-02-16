import jalaali from 'jalaali-js';

// Persian month names
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

// Persian day names
const persianDays = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
];

// Convert to Persian/Jalali date
export function toPersianDate(date: Date | string): string {
  const d = new Date(date);
  const { jy, jm, jd } = jalaali.toJalaali(d);
  return `${jd} ${persianMonths[jm - 1]} ${jy}`;
}

// Convert to Persian date with time
export function toPersianDateTime(date: Date | string): string {
  const d = new Date(date);
  const { jy, jm, jd } = jalaali.toJalaali(d);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${jd} ${persianMonths[jm - 1]} ${jy} - ${hours}:${minutes}`;
}

// Get relative time in Persian
export function getRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'لحظاتی پیش';
  if (minutes < 60) return `${minutes} دقیقه پیش`;
  if (hours < 24) return `${hours} ساعت پیش`;
  if (days < 7) return `${days} روز پیش`;
  if (weeks < 4) return `${weeks} هفته پیش`;
  if (months < 12) return `${months} ماه پیش`;
  return `${years} سال پیش`;
}

// Get Persian day name
export function getPersianDayName(date: Date | string): string {
  const d = new Date(date);
  return persianDays[d.getDay()];
}

// Format Jalali date
export function formatJalaliDate(
  date: Date | string,
  format: 'short' | 'long' | 'full' = 'long'
): string {
  const d = new Date(date);
  const { jy, jm, jd } = jalaali.toJalaali(d);

  switch (format) {
    case 'short':
      return `${jy}/${jm.toString().padStart(2, '0')}/${jd.toString().padStart(2, '0')}`;
    case 'long':
      return `${jd} ${persianMonths[jm - 1]} ${jy}`;
    case 'full':
      return `${persianDays[d.getDay()]}، ${jd} ${persianMonths[jm - 1]} ${jy}`;
    default:
      return `${jd} ${persianMonths[jm - 1]} ${jy}`;
  }
}
