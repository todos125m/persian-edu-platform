import { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'حریم خصوصی',
  description: 'سیاست حفظ حریم خصوصی پلتفرم آکادمی آموزش',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-l from-primary-600 to-primary-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <ShieldCheck className="w-12 h-12 text-white mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            حریم خصوصی
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 space-y-6 text-gray-600 leading-relaxed">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  جمع‌آوری اطلاعات
                </h2>
                <p>
                  ما اطلاعاتی را که شما هنگام ثبت‌نام ارائه می‌دهید (نام، ایمیل،
                  شماره تلفن) جمع‌آوری می‌کنیم. همچنین اطلاعات مربوط به فعالیت
                  شما در سایت مانند دوره‌های مشاهده شده و پیشرفت یادگیری ذخیره
                  می‌شود.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  استفاده از اطلاعات
                </h2>
                <p>
                  اطلاعات شما برای ارائه خدمات بهتر، ارسال اطلاع‌رسانی‌های مرتبط
                  با دوره‌ها، و بهبود تجربه کاربری استفاده می‌شود. ما هرگز
                  اطلاعات شخصی شما را بدون رضایت به اشخاص ثالث نمی‌فروشیم.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  امنیت اطلاعات
                </h2>
                <p>
                  ما از پروتکل‌های امنیتی استاندارد برای حفاظت از داده‌های شما
                  استفاده می‌کنیم. تمامی اطلاعات حساس با رمزنگاری ذخیره و منتقل
                  می‌شوند. پرداخت‌ها از طریق درگاه‌های معتبر و امن انجام می‌شود.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">کوکی‌ها</h2>
                <p>
                  ما از کوکی‌ها برای بهبود تجربه کاربری و ذخیره ترجیحات شما
                  استفاده می‌کنیم. شما می‌توانید کوکی‌ها را از تنظیمات مرورگر
                  خود غیرفعال کنید، اما ممکن است برخی قابلیت‌های سایت محدود شود.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  حقوق کاربران
                </h2>
                <p>
                  شما حق دسترسی، اصلاح و حذف اطلاعات شخصی خود را دارید. برای
                  اعمال این حقوق می‌توانید از طریق صفحه تماس با ما درخواست خود
                  را ارسال کنید.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  به‌روزرسانی سیاست
                </h2>
                <p>
                  این سیاست ممکن است به‌روزرسانی شود. آخرین نسخه همیشه در این
                  صفحه در دسترس خواهد بود.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
