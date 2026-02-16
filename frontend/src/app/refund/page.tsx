import { Metadata } from 'next';
import { RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'شرایط بازگشت وجه',
  description: 'شرایط و ضوابط بازگشت وجه در آکادمی آموزش',
};

const conditions = [
  {
    icon: CheckCircle,
    title: 'شرایط پذیرش',
    items: [
      'درخواست بازگشت وجه تا ۷ روز پس از خرید',
      'مشاهده کمتر از ۳۰٪ محتوای دوره',
      'اولین درخواست بازگشت وجه کاربر',
      'ارائه دلیل مشخص برای عدم رضایت',
    ],
    color: 'green',
  },
  {
    icon: XCircle,
    title: 'شرایط عدم پذیرش',
    items: [
      'گذشت بیش از ۷ روز از تاریخ خرید',
      'مشاهده بیش از ۳۰٪ محتوای دوره',
      'دوره‌های رایگان یا تخفیف ویژه',
      'نقض قوانین پلتفرم توسط کاربر',
    ],
    color: 'red',
  },
];

const steps = [
  {
    step: '۱',
    title: 'ثبت درخواست',
    description: 'از طریق صفحه تماس با ما، درخواست بازگشت وجه خود را ثبت کنید.',
  },
  {
    step: '۲',
    title: 'بررسی درخواست',
    description:
      'تیم پشتیبانی درخواست شما را بررسی می‌کند. این فرآیند حداکثر ۲ روز کاری طول می‌کشد.',
  },
  {
    step: '۳',
    title: 'بازگشت وجه',
    description:
      'در صورت تایید، وجه ظرف ۳ تا ۵ روز کاری به حساب بانکی شما واریز می‌شود.',
  },
];

export default function RefundPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-l from-primary-600 to-primary-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <RotateCcw className="w-12 h-12 text-white mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            شرایط بازگشت وجه
          </h1>
          <p className="text-primary-100 text-lg">
            رضایت شما برای ما اهمیت دارد
          </p>
        </div>
      </section>

      {/* Conditions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {conditions.map((condition) => (
              <div
                key={condition.title}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <condition.icon
                    className={`w-6 h-6 ${
                      condition.color === 'green'
                        ? 'text-green-600'
                        : 'text-red-500'
                    }`}
                  />
                  <h2 className="text-lg font-bold text-gray-900">
                    {condition.title}
                  </h2>
                </div>
                <ul className="space-y-3">
                  {condition.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-gray-600">
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                          condition.color === 'green'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            مراحل بازگشت وجه
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {steps.map((step) => (
              <div key={step.step} className="bg-white rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-yellow-800 mb-1">توجه</p>
                <p className="text-yellow-700 text-sm leading-relaxed">
                  بازگشت وجه فقط به شماره کارتی که پرداخت از آن انجام شده امکان‌پذیر
                  است. در صورت داشتن هرگونه سوال، با تیم پشتیبانی تماس بگیرید.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
