import { Metadata } from 'next';
import { Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'قوانین و مقررات',
  description: 'قوانین و مقررات استفاده از پلتفرم آکادمی آموزش',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-l from-primary-600 to-primary-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <Scale className="w-12 h-12 text-white mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            قوانین و مقررات
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg text-gray-600 leading-relaxed">
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  ۱. شرایط عمومی
                </h2>
                <p>
                  با ثبت‌نام در پلتفرم آکادمی آموزش، شما قوانین و مقررات زیر را
                  می‌پذیرید. لطفا قبل از استفاده از خدمات، این شرایط را با دقت
                  مطالعه نمایید.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  ۲. حساب کاربری
                </h2>
                <p>
                  هر کاربر تنها مجاز به ایجاد یک حساب کاربری است. اشتراک‌گذاری
                  حساب کاربری با دیگران ممنوع بوده و در صورت مشاهده، حساب مسدود
                  خواهد شد. حفظ امنیت رمز عبور بر عهده کاربر است.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  ۳. مالکیت معنوی
                </h2>
                <p>
                  تمامی محتوای دوره‌ها شامل ویدیوها، متون، تصاویر و فایل‌های
                  پروژه، تحت حمایت قانون کپی‌رایت قرار دارند. کپی، توزیع یا
                  فروش محتوا بدون اجازه کتبی ممنوع است.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  ۴. شرایط خرید
                </h2>
                <p>
                  قیمت‌های نمایش داده شده به تومان هستند. تخفیف‌ها دارای مهلت
                  مشخص بوده و پس از اتمام مهلت، قیمت اصلی اعمال خواهد شد. خرید
                  هر دوره به منزله دسترسی مادام‌العمر به محتوای آن دوره است.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  ۵. رفتار کاربران
                </h2>
                <p>
                  کاربران موظف به رعایت احترام متقابل در بخش پرسش و پاسخ
                  هستند. ارسال محتوای نامناسب، تبلیغاتی یا توهین‌آمیز منجر به
                  مسدود شدن حساب خواهد شد.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  ۶. تغییرات قوانین
                </h2>
                <p>
                  آکادمی آموزش حق تغییر این قوانین را در هر زمان برای خود محفوظ
                  می‌دارد. تغییرات از طریق سایت اطلاع‌رسانی خواهد شد.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
