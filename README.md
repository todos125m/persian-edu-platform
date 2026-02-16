# پلتفرم آموزشی فارسی

پلتفرم حرفه‌ای آموزش آنلاین برای فروش و پخش دوره‌های ویدیویی با طراحی کاملاً فارسی و RTL.

## ویژگی‌ها

### صفحات عمومی
- صفحه اصلی با دوره‌های ویژه و دسته‌بندی‌ها
- لیست دوره‌ها با فیلتر و جستجو
- جزئیات دوره با اطلاعات کامل و درس‌ها
- صفحه دسته‌بندی‌ها و فیلتر بر اساس دسته‌بندی
- سبد خرید
- صفحات اطلاعاتی: درباره ما، تماس با ما، سوالات متداول، قوانین، حریم خصوصی، شرایط بازگشت

### احراز هویت
- ثبت‌نام و ورود با ایمیل
- بازیابی رمز عبور
- Refresh Token با rotation خودکار
- کپچای ریاضی فارسی روی فرم‌ها
- محافظت مسیرها با Middleware (SSR)
- همگام‌سازی توکن بین Zustand و Cookie

### داشبورد کاربر
- نمای کلی (دوره‌ها، سفارش‌ها)
- دوره‌های من با پیشرفت یادگیری
- ویرایش پروفایل
- تغییر رمز عبور و تنظیمات

### پنل مدیریت (Admin Panel)
- داشبورد آماری (۴ کارت + ۲ نمودار + جداول)
- مدیریت کامل دوره‌ها (ایجاد/ویرایش/حذف با Zod validation)
- مدیریت درس‌ها با drag-and-drop برای تغییر ترتیب
- آپلود ویدیو به S3 با نوار پیشرفت و تشخیص خودکار مدت
- مدیریت کاربران (جستجو، فیلتر نقش، تغییر نقش، فعال/غیرفعال)
- مدیریت سفارش‌ها با فیلتر وضعیت
- گزارش مالی و آمار پرداخت‌ها
- مدیریت دسته‌بندی‌ها (ساختار درختی والد/فرزند)
- تنظیمات سایت (عمومی، تماس، شبکه‌های اجتماعی)
- پیش‌نمایش فروشگاه با تغییر viewport (دسکتاپ/تبلت/موبایل)
- محافظت مسیرها با چک نقش admin

### امنیت
- JWT احراز هویت (Access Token 15 دقیقه + Refresh Token 7 روز)
- لینک‌های امضا شده برای ویدیو (S3 Signed URLs)
- محافظت از دانلود غیرمجاز
- Rate Limiting
- Role-based Access Control (RBAC)
- کپچای ریاضی فارسی
- تراکنش اتمی برای پرداخت و سفارش

## تکنولوژی‌ها

| بخش | تکنولوژی |
|-----|----------|
| فرانت‌اند | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| بک‌اند | NestJS, TypeScript, Prisma ORM |
| دیتابیس | PostgreSQL |
| ذخیره ویدیو | Arvan Cloud Object Storage (S3 Compatible) |
| درگاه پرداخت | زرین‌پال |
| مدیریت State | Zustand (با persist), React Query v5 |
| فرم‌ها | React Hook Form + Zod |
| آیکون‌ها | Lucide React |
| فونت | Vazirmatn (next/font) |

## ساختار پروژه

```
persian-edu-platform/
├── backend/                    # بک‌اند NestJS
│   ├── prisma/                # Schema و migrations و seed
│   └── src/
│       ├── prisma/            # Prisma Service
│       └── modules/
│           ├── admin/         # داشبورد ادمین (آمار)
│           ├── auth/          # احراز هویت JWT + Refresh Token
│           ├── categories/    # دسته‌بندی‌ها
│           ├── courses/       # دوره‌ها
│           ├── lessons/       # درس‌ها
│           ├── orders/        # سفارش‌ها
│           ├── payments/      # پرداخت‌ها (زرین‌پال)
│           ├── settings/      # تنظیمات سایت
│           ├── users/         # کاربران
│           └── videos/        # ویدیوها + S3
├── frontend/                  # فرانت‌اند Next.js
│   └── src/
│       ├── app/
│       │   ├── (auth)/       # لاگین / ثبت‌نام / بازیابی رمز
│       │   ├── admin/        # پنل مدیریت (۱۲ صفحه)
│       │   ├── courses/      # لیست و جزئیات دوره‌ها
│       │   ├── dashboard/    # داشبورد کاربر (۴ صفحه)
│       │   ├── categories/   # دسته‌بندی‌ها
│       │   ├── cart/         # سبد خرید
│       │   ├── payment/      # پرداخت
│       │   ├── contact/      # تماس با ما
│       │   └── ...           # about, faq, terms, privacy, refund
│       ├── components/
│       │   ├── admin/        # کامپوننت‌های ادمین
│       │   ├── home/         # صفحه اصلی
│       │   ├── layout/       # Header, Footer, LayoutWrapper
│       │   ├── ui/           # کامپوننت‌های پایه + Captcha
│       │   └── video/        # پلیر ویدیو
│       ├── services/         # API calls
│       ├── store/            # Zustand stores
│       └── lib/              # ابزارها (api.ts با refresh token)
└── docs/                     # مستندات
```

## صفحات فرانت‌اند (۳۲ صفحه)

### عمومی
| مسیر | عملکرد |
|------|--------|
| `/` | صفحه اصلی |
| `/courses` | لیست دوره‌ها |
| `/courses/[slug]` | جزئیات دوره (SSR + JSON-LD) |
| `/categories` | لیست دسته‌بندی‌ها |
| `/categories/[slug]` | دوره‌های یک دسته‌بندی |
| `/cart` | سبد خرید |
| `/about` | درباره ما |
| `/contact` | تماس با ما |
| `/faq` | سوالات متداول |
| `/terms` | قوانین و مقررات |
| `/privacy` | حریم خصوصی |
| `/refund` | شرایط بازگشت وجه |

### احراز هویت
| مسیر | عملکرد |
|------|--------|
| `/login` | ورود |
| `/register` | ثبت‌نام |
| `/forgot-password` | بازیابی رمز عبور |

### داشبورد کاربر
| مسیر | عملکرد |
|------|--------|
| `/dashboard` | نمای کلی |
| `/dashboard/courses` | دوره‌های من |
| `/dashboard/profile` | ویرایش پروفایل |
| `/dashboard/settings` | تنظیمات و تغییر رمز |

### پنل مدیریت
| مسیر | عملکرد |
|------|--------|
| `/admin` | داشبورد آماری |
| `/admin/courses` | لیست دوره‌ها |
| `/admin/courses/new` | ایجاد دوره جدید |
| `/admin/courses/[id]` | جزئیات دوره + مدیریت درس‌ها |
| `/admin/courses/[id]/edit` | ویرایش دوره |
| `/admin/users` | لیست کاربران |
| `/admin/users/[id]` | جزئیات کاربر |
| `/admin/orders` | لیست سفارش‌ها |
| `/admin/payments` | گزارش مالی |
| `/admin/categories` | مدیریت دسته‌بندی‌ها |
| `/admin/settings` | تنظیمات سایت |
| `/admin/preview` | پیش‌نمایش فروشگاه |

## شروع سریع

### پیش‌نیازها

- Node.js 18+
- PostgreSQL 14+
- حساب Arvan Cloud (برای ذخیره ویدیو)
- حساب زرین‌پال (برای درگاه پرداخت)

### نصب و اجرا

```bash
# Clone پروژه
git clone https://github.com/YOUR_USERNAME/persian-edu-platform.git
cd persian-edu-platform

# ===== بک‌اند =====
cd backend
npm install
cp .env.example .env
# ویرایش فایل .env با تنظیمات خودتان

# ایجاد دیتابیس و seed
npx prisma migrate dev
npm run prisma:seed

# اجرا
npm run start:dev

# ===== فرانت‌اند =====
cd ../frontend
npm install
cp .env.example .env.local
# ویرایش فایل .env.local

npm run dev
```

### متغیرهای محیطی

#### بک‌اند (`backend/.env`)
```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://user:password@localhost:5432/persian_edu?schema=public"
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
S3_ENDPOINT=https://s3.ir-thr-at1.arvanstorage.ir
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET_NAME=edu-videos
S3_REGION=ir-thr-at1
ZARINPAL_MERCHANT_ID=your-merchant-id
ZARINPAL_SANDBOX=true
```

#### فرانت‌اند (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### آدرس‌ها

- فرانت‌اند: http://localhost:3000
- پنل ادمین: http://localhost:3000/admin
- بک‌اند API: http://localhost:4000/api/v1

### ورود ادمین

- **ایمیل:** admin@example.com
- **رمز عبور:** Admin@123456

## API Endpoints

### احراز هویت
| Method | Endpoint | توضیح |
|--------|----------|-------|
| POST | /auth/register | ثبت‌نام |
| POST | /auth/login | ورود |
| POST | /auth/refresh | تمدید توکن |
| GET | /auth/profile | پروفایل |
| PATCH | /auth/change-password | تغییر رمز عبور |

### دوره‌ها
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /courses | لیست دوره‌ها (عمومی) |
| GET | /courses/featured | دوره‌های ویژه |
| GET | /courses/slug/:slug | جزئیات دوره |
| GET | /courses/admin/all | همه دوره‌ها (ادمین) |
| POST | /courses | ایجاد دوره (ادمین) |
| PATCH | /courses/:id | ویرایش دوره (ادمین) |
| DELETE | /courses/:id | حذف دوره (ادمین) |
| PATCH | /courses/:id/toggle-featured | تغییر وضعیت ویژه (ادمین) |

### کاربران (ادمین)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /users | لیست کاربران (جستجو/فیلتر) |
| GET | /users/:id | جزئیات کاربر |
| GET | /users/roles | لیست نقش‌ها |
| PATCH | /users/:id/role | تغییر نقش |
| PATCH | /users/:id/toggle-active | فعال/غیرفعال |
| DELETE | /users/:id | حذف نرم |

### درس‌ها
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /lessons/course/:courseId | درس‌های دوره |
| POST | /lessons | ایجاد درس (ادمین) |
| PATCH | /lessons/:id | ویرایش درس (ادمین) |
| DELETE | /lessons/:id | حذف درس (ادمین) |
| POST | /lessons/course/:courseId/reorder | تغییر ترتیب (ادمین) |

### ویدیو
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /videos/:id/stream | دریافت لینک پخش |
| PATCH | /videos/:id/progress | ذخیره پیشرفت |
| POST | /videos/upload-url | دریافت لینک آپلود (ادمین) |
| POST | /videos/:id/confirm | تایید آپلود (ادمین) |
| DELETE | /videos/:id | حذف ویدیو (ادمین) |

### سفارش‌ها
| Method | Endpoint | توضیح |
|--------|----------|-------|
| POST | /orders | ایجاد سفارش |
| GET | /orders/me | سفارش‌های من |
| GET | /orders/admin/all | همه سفارش‌ها (ادمین) |

### پرداخت
| Method | Endpoint | توضیح |
|--------|----------|-------|
| POST | /payments/initiate | شروع پرداخت |
| GET | /payments/verify | تایید پرداخت |
| GET | /payments/stats | آمار پرداخت‌ها (ادمین) |

### ادمین
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /admin/dashboard/stats | آمار داشبورد |

### دسته‌بندی‌ها
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /categories | دسته‌بندی‌های فعال |
| GET | /categories/admin/all | همه دسته‌بندی‌ها (ادمین) |
| POST | /categories | ایجاد (ادمین) |
| PATCH | /categories/:id | ویرایش (ادمین) |
| DELETE | /categories/:id | حذف (ادمین) |

### تنظیمات
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /settings | تنظیمات عمومی |
| GET | /settings/admin | همه تنظیمات (ادمین) |
| PUT | /settings | بروزرسانی (ادمین) |

## طراحی UI/UX

- **RTL کامل** - طراحی از راست به چپ
- **فارسی محور** - فونت Vazirmatn، اعداد فارسی
- **واکنش‌گرا** - سازگار با موبایل، تبلت و دسکتاپ
- **Loading States** - اسکلتون بارگذاری برای صفحات اصلی
- **صفحه ۴۰۴ سفارشی** - صفحه خطای فارسی
- **Desktop-first Admin** - پنل مدیریت بهینه برای دسکتاپ

## استقرار (Deployment)

### گزینه‌های پیشنهادی

#### فرانت‌اند
- **Vercel** (پیشنهادی) - بهترین گزینه برای Next.js
- **Liara** - سرویس ابری ایرانی با پشتیبانی Next.js
- **Docker** - اجرا روی هر سرور

#### بک‌اند
- **Liara** - پشتیبانی NestJS + PostgreSQL
- **Railway** - deploy سریع با PostgreSQL
- **Docker + VPS** - سرور اختصاصی (DigitalOcean, Hetzner)

#### دیتابیس
- **Liara PostgreSQL** - سرویس ابری ایرانی
- **Supabase** - PostgreSQL رایگان
- **Railway** - PostgreSQL مدیریت‌شده

#### ذخیره ویدیو
- **Arvan Cloud** - Object Storage سازگار با S3

### Build فرانت‌اند
```bash
cd frontend
npm run build    # خروجی: .next/
npm run start    # اجرای production
```

### Build بک‌اند
```bash
cd backend
npm run build    # خروجی: dist/
npm run start:prod
```

## مراحل توسعه

- [x] فاز ۱: پایه - Schema, Auth, API
- [x] فاز ۲: هسته - Courses, Videos, Payments
- [x] فاز ۳: UI - فرانت‌اند RTL (۳۲ صفحه)
- [x] فاز ۴: پنل مدیریت - Admin Panel کامل
- [x] فاز ۵: بهبود - Refresh Token, Middleware, CAPTCHA, Loading States
- [ ] فاز ۶: تست - Unit/Integration Tests
- [ ] فاز ۷: استقرار - Deploy, Monitoring, CI/CD

## لایسنس

MIT License
