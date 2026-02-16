import { Metadata } from 'next';
import {
  BookOpen,
  Users,
  Award,
  Target,
  Heart,
  Zap,
  GraduationCap,
  Globe,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'درباره ما',
  description: 'آشنایی با آکادمی آموزش - پلتفرم آموزش آنلاین فارسی',
};

const stats = [
  { icon: Users, value: '۱۵,۰۰۰+', label: 'دانشجوی فعال' },
  { icon: BookOpen, value: '۲۵۰+', label: 'دوره آموزشی' },
  { icon: Award, value: '۵۰+', label: 'مدرس حرفه‌ای' },
  { icon: GraduationCap, value: '۸,۰۰۰+', label: 'گواهینامه صادر شده' },
];

const values = [
  {
    icon: Target,
    title: 'کیفیت محتوا',
    description:
      'تمام دوره‌های ما توسط متخصصان حرفه‌ای تهیه شده و از نظر کیفیت محتوایی و فنی بررسی می‌شوند.',
  },
  {
    icon: Heart,
    title: 'پشتیبانی دائمی',
    description:
      'تیم پشتیبانی ما به صورت ۲۴ ساعته آماده پاسخگویی به سوالات و مشکلات شماست.',
  },
  {
    icon: Zap,
    title: 'یادگیری عملی',
    description:
      'دوره‌های ما پروژه‌محور هستند و شما با انجام پروژه‌های واقعی مهارت‌های خود را تقویت می‌کنید.',
  },
  {
    icon: Globe,
    title: 'دسترسی مادام‌العمر',
    description:
      'با خرید هر دوره، دسترسی مادام‌العمر به محتوا و به‌روزرسانی‌های آینده خواهید داشت.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-l from-primary-600 to-primary-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            درباره آکادمی آموزش
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto leading-relaxed">
            ما با هدف دموکراتیک‌سازی آموزش و ایجاد فرصت‌های برابر یادگیری برای همه
            فارسی‌زبانان، این پلتفرم را راه‌اندازی کرده‌ایم.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-lg p-6 text-center"
              >
                <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">داستان ما</h2>
            <div className="prose prose-lg text-gray-600 leading-relaxed space-y-4">
              <p>
                آکادمی آموزش در سال ۱۴۰۱ با هدف ارائه آموزش‌های باکیفیت و به‌روز
                در حوزه فناوری اطلاعات تاسیس شد. ما معتقدیم هر کسی حق دارد به
                آموزش‌های حرفه‌ای دسترسی داشته باشد.
              </p>
              <p>
                تیم ما متشکل از مدرسان باتجربه و متخصصان صنعت است که با عشق به
                آموزش، بهترین محتوای آموزشی را تولید می‌کنند. ما به کیفیت محتوا
                اهمیت زیادی می‌دهیم و هر دوره قبل از انتشار، توسط تیم کارشناسان
                بررسی می‌شود.
              </p>
              <p>
                هدف نهایی ما این است که به شما کمک کنیم مهارت‌های لازم برای ورود
                به بازار کار یا ارتقای شغلی خود را کسب کنید. ما در کنار شما
                هستیم.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            ارزش‌های ما
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-xl p-6 flex gap-4"
              >
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <value.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
