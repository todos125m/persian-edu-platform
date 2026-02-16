// Persian digits
const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

// Convert to Persian numbers
export function toPersianNumber(num: number | string): string {
  return num
    .toString()
    .replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
}

// Format price in Toman with Persian digits
export function formatPrice(price: number): string {
  const formatted = price.toLocaleString('fa-IR');
  return `${formatted} تومان`;
}

// Format price with discount
export function formatPriceWithDiscount(
  price: number,
  discountPrice?: number | null
): {
  original: string;
  final: string;
  discount?: number;
  hasDiscount: boolean;
} {
  if (discountPrice && discountPrice < price) {
    const discountPercent = Math.round(((price - discountPrice) / price) * 100);
    return {
      original: formatPrice(price),
      final: formatPrice(discountPrice),
      discount: discountPercent,
      hasDiscount: true,
    };
  }
  return {
    original: formatPrice(price),
    final: formatPrice(price),
    hasDiscount: false,
  };
}

// Format duration (seconds to readable format)
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${toPersianNumber(seconds)} ثانیه`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${toPersianNumber(hours)}:${toPersianNumber(minutes).padStart(2, '۰')}:${toPersianNumber(secs).padStart(2, '۰')}`;
  }
  return `${toPersianNumber(minutes)}:${toPersianNumber(secs).padStart(2, '۰')}`;
}

// Format total duration (for courses - in minutes/hours)
export function formatTotalDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${toPersianNumber(hours)} ساعت و ${toPersianNumber(minutes)} دقیقه`;
  }
  if (hours > 0) {
    return `${toPersianNumber(hours)} ساعت`;
  }
  return `${toPersianNumber(minutes)} دقیقه`;
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '۰ بایت';

  const k = 1024;
  const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${toPersianNumber(parseFloat((bytes / Math.pow(k, i)).toFixed(2)))} ${sizes[i]}`;
}

// Format number with separators
export function formatNumber(num: number): string {
  return toPersianNumber(num.toLocaleString('fa-IR'));
}

// Format percentage
export function formatPercent(value: number): string {
  return `${toPersianNumber(Math.round(value))}٪`;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Generate slug from Persian text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
