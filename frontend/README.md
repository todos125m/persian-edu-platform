# پلتفرم آموزشی فارسی - فرانت‌اند

## معرفی

فرانت‌اند پلتفرم آموزشی فارسی با Next.js 14 و TypeScript توسعه داده شده است.
طراحی کاملاً RTL و فارسی-محور. شامل بخش عمومی (فروشگاه) و پنل مدیریت کامل.

## تکنولوژی‌ها

- **Next.js 14** - فریم‌ورک React (App Router)
- **TypeScript** - زبان برنامه‌نویسی
- **Tailwind CSS** - فریم‌ورک CSS
- **Zustand** - مدیریت State (persist با localStorage)
- **React Query** (@tanstack/react-query) - مدیریت درخواست‌های سرور
- **React Hook Form + Zod** - مدیریت و اعتبارسنجی فرم‌ها
- **Lucide React** - آیکون‌ها
- **React Toastify** - اعلان‌ها (toast)
- **jalaali-js** - تاریخ شمسی
- **Vazirmatn** - فونت فارسی

## شروع سریع

### پیش‌نیازها

- Node.js 18+
- npm یا yarn
- بک‌اند باید در حال اجرا باشد (پورت 4000)

### نصب

```bash
# نصب وابستگی‌ها
npm install

# ایجاد فایل تنظیمات
cp .env.example .env.local

# اجرای سرور توسعه
npm run dev
```

سایت روی `http://localhost:3000` بالا می‌آید.

## ساختار پروژه

```
src/
├── app/                        # صفحات (Next.js App Router)
│   ├── (auth)/                 # صفحات احراز هویت (layout جدا)
│   │   ├── login/
│   │   └── register/
│   ├── admin/                  # پنل مدیریت (13 صفحه)
│   │   ├── layout.tsx          # لایوت ادمین (سایدبار + چک نقش)
│   │   ├── page.tsx            # داشبورد آماری
│   │   ├── users/
│   │   │   ├── page.tsx        # لیست کاربران
│   │   │   └── [id]/page.tsx   # جزئیات کاربر
│   │   ├── courses/
│   │   │   ├── page.tsx        # لیست دوره‌ها
│   │   │   ├── new/page.tsx    # ایجاد دوره جدید
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # جزئیات دوره + مدیریت درس‌ها
│   │   │       └── edit/page.tsx # ویرایش دوره
│   │   ├── orders/page.tsx     # لیست سفارش‌ها
│   │   ├── payments/page.tsx   # گزارش مالی
│   │   ├── categories/page.tsx # مدیریت دسته‌بندی‌ها
│   │   ├── settings/page.tsx   # تنظیمات سایت
│   │   └── preview/page.tsx    # پیش‌نمایش فروشگاه
│   ├── courses/                # صفحات عمومی دوره‌ها
│   │   └── [slug]/
│   ├── dashboard/              # داشبورد کاربر
│   │   ├── courses/
│   │   └── profile/
│   ├── payment/                # صفحات پرداخت
│   └── page.tsx                # صفحه اصلی
├── components/
│   ├── admin/                  # کامپوننت‌های پنل مدیریت
│   │   ├── Breadcrumb.tsx      # مسیریاب فارسی خودکار
│   │   ├── CourseForm.tsx      # فرم ایجاد/ویرایش دوره (Zod validation)
│   │   ├── LessonsList.tsx     # لیست درس‌ها + drag-and-drop ترتیب
│   │   ├── LessonFormModal.tsx # مودال فرم درس
│   │   └── VideoUploader.tsx   # آپلود ویدیو به S3 + نوار پیشرفت
│   ├── home/                   # کامپوننت‌های صفحه اصلی
│   ├── layout/                 # Header, Footer
│   ├── ui/                     # کامپوننت‌های پایه
│   │   ├── Badge.tsx           # برچسب وضعیت (success/warning/danger/info/neutral)
│   │   ├── Button.tsx          # دکمه با variants + loading
│   │   ├── Card.tsx            # کارت
│   │   ├── Chart.tsx           # نمودار SVG (bar/line)
│   │   ├── ConfirmDialog.tsx   # دیالوگ تایید حذف
│   │   ├── DataTable.tsx       # جدول داده عمومی + skeleton loading
│   │   ├── EmptyState.tsx      # حالت خالی
│   │   ├── Input.tsx           # فیلد ورودی
│   │   ├── Modal.tsx           # پنجره مودال
│   │   ├── Pagination.tsx      # صفحه‌بندی با اعداد فارسی
│   │   ├── Select.tsx          # dropdown سازگار با RTL
│   │   ├── StatsCard.tsx       # کارت آمار داشبورد
│   │   ├── Textarea.tsx        # ورودی متنی چند خطی
│   │   └── index.ts            # re-export همه UI ها
│   ├── video/                  # VideoPlayer
│   └── providers/              # Context Providers
├── lib/
│   ├── api.ts                  # Axios instance (Bearer token + 401 auto-logout)
│   └── utils.ts                # توابع کمکی (formatPrice, generateSlug, cn, ...)
├── services/                   # API Services
│   ├── adminService.ts         # سرویس ادمین (همه CRUD ها + تایپ‌ها)
│   ├── authService.ts          # ثبت‌نام، ورود، پروفایل
│   ├── coursesService.ts       # دوره‌های عمومی
│   ├── ordersService.ts        # سفارش‌ها
│   └── videosService.ts        # ویدیو
├── store/                      # Zustand stores
│   ├── authStore.ts            # احراز هویت (persist)
│   └── cartStore.ts            # سبد خرید
└── styles/
    └── globals.css             # استایل‌های عمومی + Tailwind directives
```

## معماری و الگوها

### مسیریابی (App Router)
- **Route Groups**: `(auth)` برای جدا کردن لایوت لاگین/ثبت‌نام
- **Dynamic Routes**: `[slug]`, `[id]` برای صفحات پویا
- **Layouts**: لایوت‌های جدا برای عمومی، داشبورد، ادمین

### مدیریت State
- **Zustand** (`store/`): برای state سمت کلاینت (auth, cart) - persist با localStorage
- **React Query** (`@tanstack/react-query`): برای server state - cache، refetch خودکار

### API Layer
- `lib/api.ts`: Axios instance با interceptor
  - اضافه خودکار Bearer token از authStore
  - خروج خودکار (logout) در صورت دریافت 401
- `services/`: هر سرویس یک object با متدهای API مربوطه

### فرم‌ها
- **React Hook Form** برای مدیریت state فرم
- **Zod** برای schema validation
- **@hookform/resolvers/zod** برای اتصال

### کامپوننت‌های UI
همه کامپوننت‌ها با `forwardRef` ساخته شدند تا با `react-hook-form` سازگار باشند. از `index.ts` re-export می‌شوند.

### Import Aliases
- `@/*` نگاشت به `./src/*`

## پنل مدیریت (Admin Panel)

### محافظت مسیر
لایوت ادمین (`admin/layout.tsx`) نقش کاربر را چک می‌کند. اگر `user.role.name !== 'admin'` باشد به `/dashboard` ریدایرکت می‌شود.

### صفحات

| مسیر | عملکرد |
|------|--------|
| `/admin` | داشبورد آماری (4 کارت + 2 نمودار + 2 جدول) |
| `/admin/users` | لیست کاربران (جستجو، فیلتر نقش، فعال/غیرفعال، حذف) |
| `/admin/users/[id]` | جزئیات کاربر + تغییر نقش + دوره‌های ثبت‌نام شده |
| `/admin/courses` | لیست دوره‌ها (جستجو، فیلتر وضعیت، ویژه، حذف) |
| `/admin/courses/new` | فرم ایجاد دوره جدید |
| `/admin/courses/[id]` | جزئیات دوره + مدیریت درس‌ها + آپلود ویدیو |
| `/admin/courses/[id]/edit` | فرم ویرایش دوره |
| `/admin/orders` | لیست سفارش‌ها (فیلتر وضعیت: پرداخت شده/در انتظار/...) |
| `/admin/payments` | گزارش مالی (آمار تراکنش‌ها) |
| `/admin/categories` | مدیریت دسته‌بندی‌ها (ساختار درختی والد/فرزند) |
| `/admin/settings` | تنظیمات سایت (عمومی، تماس، شبکه‌های اجتماعی) |
| `/admin/preview` | پیش‌نمایش فروشگاه (iframe + تغییر viewport) |

### سرویس ادمین (`adminService.ts`)
یک سرویس مرکزی با TypeScript types برای همه عملیات ادمین:

```typescript
// تایپ‌ها
DashboardStats, AdminUser, AdminCourse, AdminLesson,
AdminOrder, AdminCategory, PaymentStats, Role

// متدها
adminService.getDashboardStats()
adminService.getUsers(params)
adminService.getUserById(id)
adminService.changeUserRole(id, roleId)
adminService.toggleUserActive(id)
adminService.deleteUser(id)
adminService.getRoles()
adminService.getCourses(params)
adminService.createCourse(data)
adminService.updateCourse(id, data)
adminService.deleteCourse(id)
adminService.toggleFeatured(id)
adminService.getLessons(courseId)
adminService.createLesson(data)
adminService.updateLesson(id, data)
adminService.deleteLesson(id)
adminService.reorderLessons(courseId, lessonIds)
adminService.getUploadUrl(data)
adminService.confirmUpload(videoId)
adminService.deleteVideo(videoId)
adminService.getOrders(params)
adminService.getPaymentStats()
adminService.getCategories()
adminService.createCategory(data)
adminService.updateCategory(id, data)
adminService.deleteCategory(id)
adminService.getSettings()
adminService.updateSettings(settings)
```

### کامپوننت‌های ادمین

| کامپوننت | توضیح |
|----------|-------|
| `CourseForm` | فرم کامل دوره با بخش‌های: اطلاعات اصلی، رسانه، قیمت‌گذاری، تنظیمات، سئو. Auto-slug از عنوان. Zod validation |
| `LessonsList` | لیست درس‌ها با HTML5 drag-and-drop برای تغییر ترتیب. دکمه‌های ویرایش/حذف/آپلود ویدیو |
| `LessonFormModal` | مودال فرم درس (عنوان، توضیحات، رایگان، منتشر شده) |
| `VideoUploader` | آپلود ویدیو با XHR مستقیم به S3. نوار پیشرفت با درصد فارسی. تشخیص خودکار مدت ویدیو. لغو آپلود. حذف/جایگزینی |
| `Breadcrumb` | مسیریاب خودکار از pathname با برچسب‌های فارسی |

## ویژگی‌های طراحی

### RTL کامل
- تمام چیدمان‌ها از راست به چپ
- فونت Vazirmatn
- تاریخ شمسی (jalaali-js)
- اعداد فارسی (تابع `toPersianNumber`)

### واکنش‌گرا
- **صفحات عمومی**: Mobile-first
- **پنل ادمین**: Desktop-first با سایدبار collapsible

### Loading States
- Skeleton loading برای جداول و کارت‌ها
- Spinner برای بارگذاری اولیه
- `isLoading` روی دکمه‌ها حین عملیات

## صفحات عمومی

- **صفحه اصلی** - Hero, دوره‌های ویژه, دسته‌بندی‌ها
- **لیست دوره‌ها** - فیلتر, جستجو, pagination
- **جزئیات دوره** - توضیحات, سرفصل‌ها, خرید
- **ورود/ثبت‌نام** - فرم‌های اعتبارسنجی شده
- **داشبورد کاربر** - پیشرفت, دوره‌های من
- **پخش ویدیو** - پلیر امن با ذخیره پیشرفت

## امنیت ویدیو

- لینک‌های امضا شده (Signed URLs)
- محدودیت زمانی لینک‌ها
- جلوگیری از دانلود مستقیم
- ذخیره خودکار پیشرفت تماشا

## متغیرهای محیطی

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## نکات توسعه

### افزودن صفحه ادمین جدید
1. فایل `page.tsx` را در `app/admin/` ایجاد کنید (از `'use client'` استفاده کنید)
2. از `useQuery`/`useMutation` برای API call استفاده کنید
3. از کامپوننت‌های `ui/` استفاده کنید (DataTable, Badge, StatsCard, ...)
4. آیتم منو را به سایدبار `admin/layout.tsx` اضافه کنید

### افزودن API جدید به سرویس ادمین
1. تایپ‌ها را در `adminService.ts` تعریف کنید
2. متد را به `adminService` object اضافه کنید
3. از `api.get/post/patch/delete` استفاده کنید

### اضافه کردن کامپوننت UI جدید
1. فایل را در `components/ui/` ایجاد کنید
2. با `forwardRef` بسازید (برای سازگاری با فرم‌ها)
3. در `components/ui/index.ts` export کنید

### الگوی استاندارد صفحه ادمین
```tsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { toast } from 'react-toastify';
// ... import UI components

export default function AdminSomethingPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'something'],
    queryFn: adminService.getSomething,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteSomething(id),
    onSuccess: () => {
      toast.success('با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['admin', 'something'] });
    },
    onError: () => toast.error('خطا در حذف'),
  });

  // ... render
}
```

## لایسنس

MIT
