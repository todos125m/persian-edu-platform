# پلتفرم آموزشی فارسی

پلتفرم حرفه‌ای آموزش آنلاین برای فروش و پخش دوره‌های ویدیویی با طراحی کاملا فارسی و RTL.

---

## ویژگی‌ها

### صفحات عمومی
- صفحه اصلی با دوره‌های ویژه، اسلایدر و دسته‌بندی‌ها
- لیست دوره‌ها با فیلتر، جستجو و صفحه‌بندی
- جزئیات دوره با اطلاعات کامل، درس‌ها و نظرات
- دسته‌بندی‌ها با ساختار درختی
- سبد خرید و پرداخت آنلاین
- سیستم آزمون آنلاین با تایمر و نمایش نتایج
- علاقه‌مندی‌ها (Wishlist)
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
- آزمون‌ها و گواهینامه‌ها
- علاقه‌مندی‌ها و اعلان‌ها
- ویرایش پروفایل با آپلود آواتار
- تغییر رمز عبور و تنظیمات

### پنل مدرس (Instructor Panel)
- داشبورد با آمار (تعداد دوره‌ها، دانشجوها، درآمد)
- مدیریت دوره‌ها (ایجاد/ویرایش/حذف)
- مدیریت درس‌ها برای هر دوره
- گزارش درآمد به تفکیک ماه و دوره

### پنل مدیریت (Admin Panel)
- داشبورد آماری (4 کارت + 2 نمودار + جداول)
- مدیریت کامل دوره‌ها (ایجاد/ویرایش/حذف با Zod validation)
- مدیریت سکشن‌ها و درس‌ها با drag-and-drop
- آپلود ویدیو به S3 با نوار پیشرفت و تشخیص خودکار مدت
- مدیریت کاربران (جستجو، فیلتر نقش، تغییر نقش، فعال/غیرفعال)
- مدیریت سفارش‌ها با فیلتر وضعیت
- گزارش مالی و آمار پرداخت‌ها
- مدیریت دسته‌بندی‌ها (ساختار درختی والد/فرزند)
- مدیریت آزمون‌ها و سوالات تستی
- مدیریت نظرات و بررسی‌ها
- مدیریت کدهای تخفیف
- مدیریت برچسب‌ها (Tags)
- ارسال اعلان‌ها به کاربران
- تنظیمات سایت (عمومی، تماس، شبکه‌های اجتماعی)
- پیش‌نمایش فروشگاه با تغییر viewport

### امنیت
- JWT احراز هویت (Access Token 15 دقیقه + Refresh Token 7 روز)
- لینک‌های امضا شده برای ویدیو (S3 Signed URLs)
- Rate Limiting
- Role-based Access Control (RBAC) - سه نقش: admin, instructor, user
- کپچای ریاضی فارسی
- تراکنش اتمی برای پرداخت و سفارش
- هدرهای امنیتی با Helmet

---

## تکنولوژی‌ها

| بخش | تکنولوژی |
|-----|----------|
| فرانت‌اند | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| بک‌اند | NestJS 10, TypeScript, Prisma ORM |
| دیتابیس | PostgreSQL 16 |
| ذخیره ویدیو | Arvan Cloud Object Storage (S3 Compatible) |
| درگاه پرداخت | زرین‌پال |
| مدیریت State | Zustand (با persist), React Query v5 |
| فرم‌ها | React Hook Form + Zod |
| آیکون‌ها | Lucide React |
| فونت | Vazirmatn (next/font) |
| اعلان‌ها | React Toastify |
| اسلایدر | Swiper |
| ویدیو پلیر | React Player |
| تاریخ شمسی | jalaali-js |
| استقرار | Docker Compose + Nginx |

---

## ساختار پروژه

```
persian-edu-platform/
├── backend/                        # بک‌اند NestJS
│   ├── prisma/                     # Schema, migrations, seed
│   └── src/
│       ├── prisma/                 # Prisma Service
│       └── modules/
│           ├── admin/              # داشبورد ادمین (آمار)
│           ├── auth/               # احراز هویت JWT + Refresh Token
│           ├── categories/         # دسته‌بندی‌ها
│           ├── certificates/       # گواهینامه‌ها
│           ├── courses/            # دوره‌ها
│           ├── discount-codes/     # کدهای تخفیف
│           ├── instructor/         # پنل مدرس
│           ├── lessons/            # درس‌ها
│           ├── notifications/      # اعلان‌ها
│           ├── orders/             # سفارش‌ها
│           ├── payments/           # پرداخت‌ها (زرین‌پال)
│           ├── quizzes/            # آزمون‌ها
│           ├── reviews/            # نظرات و بررسی‌ها
│           ├── sections/           # سکشن‌های دوره
│           ├── settings/           # تنظیمات سایت
│           ├── tags/               # برچسب‌ها
│           ├── users/              # کاربران
│           ├── videos/             # ویدیوها + S3
│           └── wishlists/          # علاقه‌مندی‌ها
├── frontend/                       # فرانت‌اند Next.js
│   └── src/
│       ├── app/
│       │   ├── (auth)/             # لاگین / ثبت‌نام / بازیابی رمز
│       │   ├── admin/              # پنل مدیریت (17 صفحه)
│       │   ├── instructor/         # پنل مدرس (4 صفحه)
│       │   ├── dashboard/          # داشبورد کاربر (8 صفحه)
│       │   ├── courses/            # لیست و جزئیات دوره‌ها
│       │   ├── categories/         # دسته‌بندی‌ها
│       │   ├── quizzes/            # آزمون‌ها
│       │   ├── cart/               # سبد خرید
│       │   └── ...                 # about, contact, faq, terms, privacy, refund
│       ├── components/
│       │   ├── admin/              # کامپوننت‌های ادمین (7 فایل)
│       │   ├── courses/            # صفحه جزئیات دوره
│       │   ├── home/               # صفحه اصلی
│       │   ├── layout/             # Header, Footer, LayoutWrapper
│       │   ├── ui/                 # 15 کامپوننت پایه
│       │   └── video/              # پلیر ویدیو
│       ├── services/               # 12 سرویس API
│       ├── store/                  # Zustand stores
│       └── lib/                    # ابزارها (api.ts, utils.ts)
├── nginx/                          # تنظیمات Nginx
├── docker-compose.yml              # اجرای Docker
├── .env.example                    # نمونه متغیرهای محیطی
└── README.md
```

---

## صفحات فرانت‌اند (46 صفحه)

### عمومی
| مسیر | عملکرد |
|------|--------|
| `/` | صفحه اصلی |
| `/courses` | لیست دوره‌ها |
| `/courses/[slug]` | جزئیات دوره (SSR + JSON-LD) |
| `/categories` | لیست دسته‌بندی‌ها |
| `/categories/[slug]` | دوره‌های یک دسته‌بندی |
| `/quizzes` | لیست آزمون‌ها |
| `/quizzes/[slug]` | شرکت در آزمون |
| `/cart` | سبد خرید |
| `/payment/callback` | نتیجه پرداخت |
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
| `/dashboard/quizzes` | آزمون‌های من |
| `/dashboard/certificates` | گواهینامه‌ها |
| `/dashboard/wishlist` | علاقه‌مندی‌ها |
| `/dashboard/notifications` | اعلان‌ها |
| `/dashboard/profile` | ویرایش پروفایل |
| `/dashboard/settings` | تنظیمات و تغییر رمز |

### پنل مدرس
| مسیر | عملکرد |
|------|--------|
| `/instructor` | داشبورد مدرس |
| `/instructor/courses` | دوره‌های من |
| `/instructor/courses/new` | ایجاد دوره جدید |
| `/instructor/revenue` | گزارش درآمد |

### پنل مدیریت
| مسیر | عملکرد |
|------|--------|
| `/admin` | داشبورد آماری |
| `/admin/courses` | لیست دوره‌ها |
| `/admin/courses/new` | ایجاد دوره جدید |
| `/admin/courses/[id]` | جزئیات دوره + درس‌ها + سکشن‌ها |
| `/admin/courses/[id]/edit` | ویرایش دوره |
| `/admin/users` | لیست کاربران |
| `/admin/users/[id]` | جزئیات کاربر |
| `/admin/orders` | لیست سفارش‌ها |
| `/admin/orders/[id]` | جزئیات سفارش |
| `/admin/payments` | گزارش مالی |
| `/admin/categories` | مدیریت دسته‌بندی‌ها |
| `/admin/quizzes` | مدیریت آزمون‌ها |
| `/admin/reviews` | مدیریت نظرات |
| `/admin/discount-codes` | کدهای تخفیف |
| `/admin/tags` | مدیریت برچسب‌ها |
| `/admin/notifications` | ارسال اعلان‌ها |
| `/admin/settings` | تنظیمات سایت |
| `/admin/preview` | پیش‌نمایش فروشگاه |

---

## API Endpoints

### احراز هویت (`/auth`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| POST | /auth/register | ثبت‌نام |
| POST | /auth/login | ورود |
| POST | /auth/refresh | تمدید توکن |
| GET | /auth/profile | پروفایل |
| PATCH | /auth/profile | ویرایش پروفایل |
| POST | /auth/avatar | آپلود آواتار |
| PATCH | /auth/change-password | تغییر رمز عبور |
| POST | /auth/forgot-password | درخواست بازیابی رمز |

### دوره‌ها (`/courses`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /courses | لیست دوره‌ها (عمومی) |
| GET | /courses/featured | دوره‌های ویژه |
| GET | /courses/slug/:slug | جزئیات دوره |
| GET | /courses/admin/all | همه دوره‌ها (ادمین) |
| POST | /courses | ایجاد دوره (ادمین) |
| PATCH | /courses/:id | ویرایش دوره (ادمین) |
| DELETE | /courses/:id | حذف دوره (ادمین) |
| PATCH | /courses/:id/toggle-featured | تغییر وضعیت ویژه |

### کاربران (`/users`) - ادمین
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /users | لیست کاربران (جستجو/فیلتر) |
| GET | /users/:id | جزئیات کاربر |
| GET | /users/roles | لیست نقش‌ها |
| PATCH | /users/:id/role | تغییر نقش |
| PATCH | /users/:id/toggle-active | فعال/غیرفعال |
| DELETE | /users/:id | حذف نرم |

### درس‌ها (`/lessons`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /lessons/course/:courseId | درس‌های دوره |
| POST | /lessons | ایجاد درس |
| PATCH | /lessons/:id | ویرایش درس |
| DELETE | /lessons/:id | حذف درس |
| POST | /lessons/course/:courseId/reorder | تغییر ترتیب |

### سکشن‌ها (`/sections`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /sections/course/:courseId | سکشن‌های دوره |
| POST | /sections | ایجاد سکشن |
| PATCH | /sections/:id | ویرایش سکشن |
| DELETE | /sections/:id | حذف سکشن |
| POST | /sections/reorder | تغییر ترتیب |

### ویدیو (`/videos`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /videos/:id/stream | دریافت لینک پخش |
| PATCH | /videos/:id/progress | ذخیره پیشرفت |
| POST | /videos/upload-url | دریافت لینک آپلود |
| POST | /videos/:id/confirm | تایید آپلود |
| DELETE | /videos/:id | حذف ویدیو |

### سفارش‌ها (`/orders`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| POST | /orders | ایجاد سفارش |
| GET | /orders/me | سفارش‌های من |
| GET | /orders/admin/all | همه سفارش‌ها (ادمین) |
| GET | /orders/:id | جزئیات سفارش |

### پرداخت (`/payments`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| POST | /payments/initiate | شروع پرداخت |
| GET | /payments/verify | تایید پرداخت |
| GET | /payments/stats | آمار پرداخت‌ها (ادمین) |

### دسته‌بندی‌ها (`/categories`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /categories | دسته‌بندی‌های فعال |
| GET | /categories/admin/all | همه دسته‌بندی‌ها (ادمین) |
| POST | /categories | ایجاد |
| PATCH | /categories/:id | ویرایش |
| DELETE | /categories/:id | حذف |

### آزمون‌ها (`/quizzes`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /quizzes | لیست آزمون‌ها |
| GET | /quizzes/:slug | جزئیات آزمون |
| POST | /quizzes/:id/submit | ارسال پاسخ‌ها |
| POST | /quizzes | ایجاد آزمون (ادمین) |
| PATCH | /quizzes/:id | ویرایش آزمون (ادمین) |
| DELETE | /quizzes/:id | حذف آزمون (ادمین) |

### نظرات (`/reviews`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /reviews/course/:courseId | نظرات دوره |
| POST | /reviews | ثبت نظر |
| GET | /reviews/admin/all | همه نظرات (ادمین) |
| PATCH | /reviews/:id/approve | تایید نظر (ادمین) |
| DELETE | /reviews/:id | حذف نظر (ادمین) |

### کدهای تخفیف (`/discount-codes`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| POST | /discount-codes/validate | اعتبارسنجی کد |
| GET | /discount-codes | لیست کدها (ادمین) |
| POST | /discount-codes | ایجاد کد (ادمین) |
| PATCH | /discount-codes/:id | ویرایش (ادمین) |
| DELETE | /discount-codes/:id | حذف (ادمین) |

### گواهینامه‌ها (`/certificates`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /certificates/me | گواهینامه‌های من |
| GET | /certificates/:id | جزئیات گواهینامه |

### برچسب‌ها (`/tags`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /tags | لیست برچسب‌ها |
| GET | /tags/popular | برچسب‌های پرکاربرد |
| POST | /tags | ایجاد (ادمین) |
| DELETE | /tags/:id | حذف (ادمین) |

### علاقه‌مندی‌ها (`/wishlists`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /wishlists | لیست علاقه‌مندی‌ها |
| POST | /wishlists/toggle/:courseId | افزودن/حذف |

### اعلان‌ها (`/notifications`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /notifications | اعلان‌های من |
| GET | /notifications/unread-count | تعداد خوانده‌نشده |
| PATCH | /notifications/:id/read | خواندن |
| PATCH | /notifications/read-all | خواندن همه |
| POST | /notifications/send-all | ارسال به همه (ادمین) |

### پنل مدرس (`/instructor`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /instructor/dashboard | داشبورد مدرس |
| GET | /instructor/courses | دوره‌های من |
| POST | /instructor/courses | ایجاد دوره |
| PATCH | /instructor/courses/:id | ویرایش دوره |
| DELETE | /instructor/courses/:id | حذف دوره |
| GET | /instructor/courses/:id/lessons | درس‌های دوره |
| POST | /instructor/courses/:id/lessons | ایجاد درس |
| PATCH | /instructor/lessons/:id | ویرایش درس |
| DELETE | /instructor/lessons/:id | حذف درس |
| GET | /instructor/revenue | گزارش درآمد |

### ادمین (`/admin`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /admin/dashboard/stats | آمار داشبورد |

### تنظیمات (`/settings`)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | /settings | تنظیمات عمومی |
| GET | /settings/admin | همه تنظیمات (ادمین) |
| PUT | /settings | بروزرسانی (ادمین) |

---

## شروع سریع

### پیش‌نیازها

- Node.js 18+
- PostgreSQL 14+
- حساب Arvan Cloud (برای ذخیره ویدیو)
- حساب زرین‌پال (برای درگاه پرداخت)

### نصب و اجرا (دستی)

```bash
# Clone پروژه
git clone <repo-url>
cd persian-edu-platform

# ===== بک‌اند =====
cd backend
npm install
cp .env.example .env
# ویرایش فایل .env با تنظیمات خودتان

# ایجاد دیتابیس و seed
npx prisma migrate dev
npm run prisma:seed

# اجرا (حالت توسعه)
npm run start:dev
# بک‌اند روی http://localhost:4000

# ===== فرانت‌اند =====
cd ../frontend
npm install
cp .env.example .env.local
# ویرایش فایل .env.local

npm run dev
# فرانت‌اند روی http://localhost:3000
```

### نصب و اجرا (Docker)

```bash
cp .env.example .env
# ویرایش فایل .env

# اجرای همه سرویس‌ها
docker compose up -d

# اجرای migration و seed
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run prisma:seed

# با Nginx (حالت production)
docker compose --profile production up -d
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

# S3 Storage (Arvan Cloud)
S3_ENDPOINT=https://s3.ir-thr-at1.arvanstorage.ir
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET_NAME=edu-videos
S3_REGION=ir-thr-at1

# Payment (Zarinpal)
ZARINPAL_MERCHANT_ID=your-merchant-id
ZARINPAL_SANDBOX=true
```

#### فرانت‌اند (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### آدرس‌ها

| سرویس | آدرس |
|--------|------|
| فرانت‌اند | http://localhost:3000 |
| داشبورد کاربر | http://localhost:3000/dashboard |
| پنل مدرس | http://localhost:3000/instructor |
| پنل ادمین | http://localhost:3000/admin |
| بک‌اند API | http://localhost:4000/api/v1 |

### ورود ادمین

- **ایمیل:** `admin@example.com`
- **رمز عبور:** `Admin@123456`

---

## Build

### فرانت‌اند
```bash
cd frontend
npm run build    # خروجی: .next/
npm run start    # اجرای production
```

### بک‌اند
```bash
cd backend
npm run build    # خروجی: dist/
npm run start:prod
```

---

## طراحی UI/UX

- **RTL کامل** - طراحی از راست به چپ
- **فارسی محور** - فونت Vazirmatn، اعداد فارسی
- **واکنش‌گرا** - سازگار با موبایل، تبلت و دسکتاپ
- **Loading States** - اسکلتون بارگذاری برای صفحات
- **صفحه 404 سفارشی** - صفحه خطای فارسی
- **Desktop-first Admin** - پنل مدیریت بهینه برای دسکتاپ

---

## کامپوننت‌های UI

| کامپوننت | کاربرد |
|----------|--------|
| Button | دکمه با variant های مختلف و حالت loading |
| Input | ورودی متنی با label و error |
| Textarea | ورودی چند خطی |
| Select | کشویی سازگار با RTL |
| Modal | دیالوگ مودال |
| Badge | برچسب‌های وضعیت (success, warning, danger, info) |
| DataTable | جدول داده با loading skeleton |
| Pagination | صفحه‌بندی با اعداد فارسی |
| StatsCard | کارت آمار برای داشبورد |
| Chart | نمودار SVG (bar/line) |
| ConfirmDialog | دیالوگ تایید حذف |
| EmptyState | حالت خالی |
| CourseCard | کارت دوره |
| Card | کارت عمومی |
| Captcha | کپچای ریاضی فارسی |

---

## استقرار (Deployment)

### گزینه‌های پیشنهادی

| بخش | سرویس | توضیح |
|-----|-------|-------|
| فرانت‌اند | Vercel / Liara | بهترین برای Next.js |
| بک‌اند | Liara / Railway / VPS | پشتیبانی NestJS |
| دیتابیس | Liara / Supabase / Railway | PostgreSQL مدیریت‌شده |
| ذخیره ویدیو | Arvan Cloud | Object Storage S3 |
| Docker | VPS (Hetzner, DigitalOcean) | docker-compose.yml آماده |

---

## مراحل توسعه

- [x] فاز 1: پایه - Schema, Auth, API
- [x] فاز 2: هسته - Courses, Videos, Payments
- [x] فاز 3: UI - فرانت‌اند RTL
- [x] فاز 4: پنل مدیریت کامل
- [x] فاز 5: پنل مدرس
- [x] فاز 6: بهبود - Refresh Token, Middleware, CAPTCHA
- [x] فاز 7: ویژگی‌ها - آزمون، نظرات، تخفیف، برچسب، علاقه‌مندی، اعلان
- [ ] فاز 8: تست - Unit/Integration Tests
- [ ] فاز 9: استقرار - Deploy, Monitoring, CI/CD

---

## لایسنس

MIT License
