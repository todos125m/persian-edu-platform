# پلتفرم آموزشی فارسی - بک‌اند

## معرفی

بک‌اند پلتفرم آموزشی فارسی با NestJS و TypeScript توسعه داده شده است. شامل API کامل برای مدیریت دوره‌ها، کاربران، پرداخت‌ها، ویدیوها و پنل مدیریت.

## تکنولوژی‌ها

- **NestJS** - فریم‌ورک Node.js
- **TypeScript** - زبان برنامه‌نویسی
- **Prisma** - ORM دیتابیس
- **PostgreSQL** - پایگاه داده
- **JWT** - احراز هویت
- **AWS S3 SDK** - ذخیره‌سازی ویدیو (سازگار با Arvan Cloud)
- **class-validator** - اعتبارسنجی ورودی‌ها
- **Helmet** - هدرهای امنیتی
- **@nestjs/throttler** - Rate Limiting

## شروع سریع

### پیش‌نیازها

- Node.js 18+
- PostgreSQL 14+
- npm یا yarn

### نصب

```bash
# نصب وابستگی‌ها
npm install

# کپی فایل تنظیمات
cp .env.example .env

# ویرایش فایل .env با اطلاعات خودتان

# ایجاد دیتابیس
npx prisma migrate dev

# اجرای seed (داده‌های اولیه)
npm run prisma:seed

# اجرای سرور توسعه
npm run start:dev
```

سرور روی پورت `4000` بالا می‌آید: `http://localhost:4000/api/v1`

## ساختار پروژه

```
src/
├── main.ts                 # نقطه ورود اپلیکیشن
├── app.module.ts           # ماژول اصلی (ثبت همه ماژول‌ها)
├── prisma/                 # سرویس Prisma (Global)
│   ├── prisma.module.ts    # @Global() - نیازی به import مجدد نیست
│   └── prisma.service.ts
└── modules/
    ├── admin/              # داشبورد ادمین (آمار کلی)
    │   ├── admin.module.ts
    │   ├── admin.controller.ts
    │   └── admin.service.ts
    ├── auth/               # احراز هویت JWT
    │   ├── auth.module.ts
    │   ├── auth.service.ts
    │   ├── auth.controller.ts
    │   ├── dto/
    │   │   ├── login.dto.ts
    │   │   └── register.dto.ts
    │   ├── guards/
    │   │   ├── jwt-auth.guard.ts
    │   │   └── roles.guard.ts     # چک نقش با @Roles('admin')
    │   └── strategies/
    │       └── jwt.strategy.ts     # payload: { sub: userId, role: roleName }
    ├── users/              # مدیریت کاربران
    │   ├── users.module.ts
    │   ├── users.service.ts        # findAll (search/role filter), changeRole, toggleActive
    │   └── users.controller.ts     # CRUD + roles list + role change
    ├── courses/            # مدیریت دوره‌ها
    │   ├── courses.module.ts
    │   ├── courses.service.ts      # findAll (search/status/category filter), CRUD
    │   └── courses.controller.ts   # admin/all + public endpoints
    ├── lessons/            # مدیریت درس‌ها
    │   ├── lessons.module.ts
    │   ├── lessons.service.ts      # CRUD + reorder
    │   └── lessons.controller.ts
    ├── videos/             # مدیریت ویدیو + S3
    │   ├── videos.module.ts
    │   ├── videos.service.ts       # upload URL, confirm, stream, progress
    │   ├── videos.controller.ts
    │   └── s3.service.ts           # Arvan Cloud S3 client
    ├── categories/         # دسته‌بندی‌ها (ساختار درختی)
    │   ├── categories.module.ts
    │   ├── categories.service.ts
    │   └── categories.controller.ts
    ├── orders/             # سفارش‌ها
    │   ├── orders.module.ts
    │   ├── orders.service.ts
    │   └── orders.controller.ts
    ├── payments/           # پرداخت‌ها
    │   ├── payments.module.ts
    │   ├── payments.service.ts
    │   ├── payments.controller.ts
    │   └── gateways/
    │       └── zarinpal.gateway.ts # درگاه زرین‌پال
    └── settings/           # تنظیمات سایت
        ├── settings.module.ts
        ├── settings.service.ts     # getPublic, getAll (grouped), updateBulk (upsert)
        └── settings.controller.ts  # GET public + GET/PUT admin
```

## معماری و الگوها

### PrismaModule (@Global)
ماژول Prisma به صورت `@Global()` تعریف شده و نیازی به import مجدد در ماژول‌های دیگر نیست. فقط `PrismaService` را inject کنید.

### احراز هویت (Auth)
- **JWT Strategy**: از Bearer token در header استفاده می‌کند
- **Payload**: `{ sub: userId, role: roleName }` - نقش به صورت string ذخیره می‌شود
- **Guards**:
  - `JwtAuthGuard` - چک لاگین بودن
  - `RolesGuard` + `@Roles('admin')` - چک نقش کاربر
- **اعمال**: با `@UseGuards(JwtAuthGuard, RolesGuard)` و `@Roles('admin')` روی controller

### Soft Delete
حذف نرم با فیلد `deletedAt`. همه کوئری‌ها باید `where: { deletedAt: null }` داشته باشند.

### Pagination
الگوی استاندارد پاسخ صفحه‌بندی:
```typescript
{
  data: T[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

## API Endpoints

### احراز هویت (`/auth`)
| Method | Endpoint | دسترسی | توضیح |
|--------|----------|--------|-------|
| POST | `/auth/register` | عمومی | ثبت‌نام کاربر جدید |
| POST | `/auth/login` | عمومی | ورود و دریافت JWT token |
| GET | `/auth/profile` | کاربر | پروفایل کاربر لاگین شده |

### کاربران (`/users`)
| Method | Endpoint | دسترسی | توضیح |
|--------|----------|--------|-------|
| GET | `/users` | ادمین | لیست کاربران (query: search, role, page, limit) |
| GET | `/users/roles` | ادمین | لیست نقش‌های سیستم |
| GET | `/users/:id` | ادمین | جزئیات یک کاربر |
| PATCH | `/users/:id/role` | ادمین | تغییر نقش کاربر (body: { roleId }) |
| PATCH | `/users/:id/toggle-active` | ادمین | فعال/غیرفعال کردن |
| DELETE | `/users/:id` | ادمین | حذف نرم کاربر |

### دوره‌ها (`/courses`)
| Method | Endpoint | دسترسی | توضیح |
|--------|----------|--------|-------|
| GET | `/courses` | عمومی | لیست دوره‌های منتشر شده (query: page, limit, category, search) |
| GET | `/courses/featured` | عمومی | دوره‌های ویژه |
| GET | `/courses/slug/:slug` | عمومی | جزئیات دوره با slug |
| GET | `/courses/admin/all` | ادمین | همه دوره‌ها (query: search, status, category, page, limit) |
| POST | `/courses` | ادمین | ایجاد دوره جدید |
| PATCH | `/courses/:id` | ادمین | ویرایش دوره |
| DELETE | `/courses/:id` | ادمین | حذف دوره |
| PATCH | `/courses/:id/toggle-featured` | ادمین | تغییر وضعیت ویژه |

### درس‌ها (`/lessons`)
| Method | Endpoint | دسترسی | توضیح |
|--------|----------|--------|-------|
| GET | `/lessons/course/:courseId` | کاربر | درس‌های یک دوره |
| POST | `/lessons` | ادمین | ایجاد درس جدید |
| PATCH | `/lessons/:id` | ادمین | ویرایش درس |
| DELETE | `/lessons/:id` | ادمین | حذف درس |
| POST | `/lessons/course/:courseId/reorder` | ادمین | تغییر ترتیب درس‌ها (body: { lessonIds: string[] }) |

### ویدیو (`/videos`)
| Method | Endpoint | دسترسی | توضیح |
|--------|----------|--------|-------|
| GET | `/videos/:id/stream` | کاربر | دریافت لینک پخش امضا شده |
| PATCH | `/videos/:id/progress` | کاربر | ذخیره پیشرفت تماشا |
| POST | `/videos/upload-url` | ادمین | دریافت لینک آپلود S3 (pre-signed URL) |
| POST | `/videos/:id/confirm` | ادمین | تایید آپلود موفق ویدیو |
| DELETE | `/videos/:id` | ادمین | حذف ویدیو از S3 و دیتابیس |

### سفارش‌ها (`/orders`)
| Method | Endpoint | دسترسی | توضیح |
|--------|----------|--------|-------|
| POST | `/orders` | کاربر | ایجاد سفارش جدید |
| GET | `/orders/me` | کاربر | سفارش‌های کاربر |
| GET | `/orders/admin/all` | ادمین | همه سفارش‌ها (query: status, page, limit) |

### پرداخت (`/payments`)
| Method | Endpoint | دسترسی | توضیح |
|--------|----------|--------|-------|
| POST | `/payments/initiate` | کاربر | شروع فرآیند پرداخت |
| GET | `/payments/verify` | عمومی | callback تایید پرداخت (زرین‌پال) |
| GET | `/payments/stats` | ادمین | آمار پرداخت‌ها (مجموع، موفق، ناموفق، ماهانه) |

### داشبورد ادمین (`/admin`)
| Method | Endpoint | دسترسی | توضیح |
|--------|----------|--------|-------|
| GET | `/admin/dashboard/stats` | ادمین | آمار کلی داشبورد |

پاسخ شامل:
- `totalUsers`, `totalCourses`, `totalOrders`, `totalRevenue`
- `recentOrders` - ۵ سفارش آخر
- `monthlyRevenue` - درآمد ۶ ماه اخیر (برای نمودار)
- `userGrowth` - رشد کاربران ۶ ماه اخیر (برای نمودار)
- `topCourses` - ۵ دوره پرفروش

### دسته‌بندی‌ها (`/categories`)
| Method | Endpoint | دسترسی | توضیح |
|--------|----------|--------|-------|
| GET | `/categories` | عمومی | دسته‌بندی‌های فعال (ساختار درختی) |
| GET | `/categories/admin/all` | ادمین | همه دسته‌بندی‌ها با تعداد دوره‌ها |
| POST | `/categories` | ادمین | ایجاد دسته‌بندی |
| PATCH | `/categories/:id` | ادمین | ویرایش دسته‌بندی |
| DELETE | `/categories/:id` | ادمین | حذف دسته‌بندی |

### تنظیمات (`/settings`)
| Method | Endpoint | دسترسی | توضیح |
|--------|----------|--------|-------|
| GET | `/settings` | عمومی | تنظیمات عمومی (key-value flat) |
| GET | `/settings/admin` | ادمین | همه تنظیمات (گروه‌بندی شده) |
| PUT | `/settings` | ادمین | بروزرسانی تنظیمات (body: [{ key, value }]) |

گروه‌های تنظیمات:
- `general` - نام سایت، توضیحات
- `contact` - ایمیل، تلفن
- `social` - اینستاگرام، تلگرام، لینکدین

## امنیت

- **JWT** - احراز هویت با Bearer token
- **Rate Limiting** - 100 درخواست در دقیقه
- **Helmet** - هدرهای امنیتی
- **class-validator** - اعتبارسنجی ورودی
- **CORS** - محدود به origin فرانت‌اند
- **Signed URLs** - لینک‌های امضا شده برای ویدیو با محدودیت زمانی
- **RBAC** - کنترل دسترسی مبتنی بر نقش

## ذخیره‌سازی ویدیو (Arvan Cloud S3)

از AWS SDK با endpoint سفارشی Arvan Cloud استفاده می‌شود:

1. فرانت‌اند از `/videos/upload-url` لینک آپلود می‌گیرد
2. فایل مستقیم به S3 آپلود می‌شود (بدون عبور از بک‌اند)
3. بعد از آپلود، `/videos/:id/confirm` برای تایید فراخوانی می‌شود
4. برای پخش، `/videos/:id/stream` لینک امضا شده با انقضا برمی‌گرداند

## درگاه‌های پرداخت

- زرین‌پال (پیاده‌سازی شده) - sandbox پشتیبانی می‌شود

## متغیرهای محیطی

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/persian_edu
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d

# Arvan Cloud S3
S3_ENDPOINT=https://s3.ir-thr-at1.arvanstorage.ir
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_REGION=ir-thr-at1

# Zarinpal
ZARINPAL_MERCHANT_ID=your-merchant-id
ZARINPAL_SANDBOX=true
ZARINPAL_CALLBACK_URL=http://localhost:3000/payment/verify

# App
PORT=4000
FRONTEND_URL=http://localhost:3000
```

## اطلاعات ورود ادمین

پس از اجرای seed:
- **ایمیل:** admin@example.com
- **رمز عبور:** Admin@123456

## نکات توسعه

### افزودن ماژول جدید
1. فولدر جدید در `src/modules/` ایجاد کنید
2. فایل‌های `module.ts`, `service.ts`, `controller.ts` بسازید
3. ماژول را در `app.module.ts` ثبت کنید
4. نیازی به import PrismaModule نیست (Global است)

### افزودن endpoint ادمین
1. `@UseGuards(JwtAuthGuard, RolesGuard)` و `@Roles('admin')` به controller اضافه کنید
2. DTO با class-validator بسازید
3. سرویس را پیاده‌سازی کنید

## لایسنس

MIT
