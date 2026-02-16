'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'آیا دوره‌ها مادام‌العمر هستند؟',
    answer:
      'بله، با خرید هر دوره دسترسی مادام‌العمر به محتوای آن خواهید داشت و به‌روزرسانی‌های آینده نیز برای شما رایگان خواهد بود.',
  },
  {
    question: 'آیا امکان بازگشت وجه وجود دارد؟',
    answer:
      'بله، در صورت عدم رضایت تا ۷ روز پس از خرید می‌توانید درخواست بازگشت وجه بدهید. شرایط کامل را در صفحه بازگشت وجه مطالعه کنید.',
  },
  {
    question: 'آیا گواهینامه پایان دوره صادر می‌شود؟',
    answer:
      'بله، پس از تکمیل هر دوره و مشاهده تمام ویدیوها، گواهینامه معتبر پایان دوره برای شما صادر خواهد شد.',
  },
  {
    question: 'چگونه می‌توانم با مدرس ارتباط برقرار کنم؟',
    answer:
      'در هر دوره بخش پرسش و پاسخ وجود دارد که می‌توانید سوالات خود را مطرح کنید. همچنین از طریق تیکت پشتیبانی نیز امکان ارتباط وجود دارد.',
  },
  {
    question: 'آیا دوره‌ها قابل دانلود هستند؟',
    answer:
      'به دلایل حفظ حقوق مالکیت معنوی، ویدیوها قابل دانلود نیستند اما می‌توانید به صورت آنلاین و بدون محدودیت مشاهده کنید.',
  },
  {
    question: 'پیش‌نیاز دوره‌ها چیست؟',
    answer:
      'پیش‌نیاز هر دوره در صفحه معرفی آن دوره ذکر شده است. دوره‌های سطح مبتدی نیاز به هیچ پیش‌نیازی ندارند.',
  },
  {
    question: 'چه روش‌های پرداختی پشتیبانی می‌شود؟',
    answer:
      'در حال حاضر پرداخت از طریق درگاه زرین‌پال و تمامی کارت‌های بانکی عضو شبکه شتاب امکان‌پذیر است.',
  },
  {
    question: 'آیا تخفیف گروهی دارید؟',
    answer:
      'بله، برای سازمان‌ها و شرکت‌ها تخفیف‌های ویژه در نظر گرفته شده. برای اطلاعات بیشتر با بخش فروش تماس بگیرید.',
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-l from-primary-600 to-primary-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            سوالات متداول
          </h1>
          <p className="text-primary-100 text-lg">
            پاسخ سوالات رایج درباره آکادمی و دوره‌ها
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-5 text-right hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary-600 shrink-0" />
                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-gray-400 shrink-0 transition-transform',
                      openIndex === index && 'rotate-180'
                    )}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-5 pb-5 pr-13 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
