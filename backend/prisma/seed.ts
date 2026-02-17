import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 شروع seed دیتابیس...');

  // ============ Roles ============
  console.log('📌 ایجاد نقش‌ها...');

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      nameFA: 'مدیر',
      description: 'دسترسی کامل به تمام بخش‌ها',
    },
  });

  const instructorRole = await prisma.role.upsert({
    where: { name: 'instructor' },
    update: {},
    create: {
      name: 'instructor',
      nameFA: 'مدرس',
      description: 'امکان ایجاد و مدیریت دوره‌ها',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      nameFA: 'کاربر',
      description: 'کاربر عادی سایت',
    },
  });

  // ============ Admin User ============
  console.log('👤 ایجاد کاربر ادمین...');

  const hashedPassword = await bcrypt.hash('Admin@123456', 12);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'مدیر',
      lastName: 'سیستم',
      isActive: true,
      isVerified: true,
      roleId: adminRole.id,
    },
  });

  // ============ Categories ============
  console.log('📂 ایجاد دسته‌بندی‌ها...');

  // Parent: ریاضیات
  const mathParent = await prisma.category.upsert({
    where: { slug: 'math' },
    update: {},
    create: { name: 'math', nameFA: 'ریاضیات', slug: 'math', icon: '📐', sortOrder: 1, isActive: true },
  });

  // Sub-categories
  const mathCategories = [
    { name: 'math-10', nameFA: 'ریاضی دهم', slug: 'math-10', icon: '🔢', sortOrder: 1, parentId: mathParent.id },
    { name: 'math-11', nameFA: 'ریاضی یازدهم', slug: 'math-11', icon: '📏', sortOrder: 2, parentId: mathParent.id },
    { name: 'math-12', nameFA: 'ریاضی دوازدهم', slug: 'math-12', icon: '📊', sortOrder: 3, parentId: mathParent.id },
    { name: 'math-final', nameFA: 'ریاضی نهایی', slug: 'math-final', icon: '🎯', sortOrder: 4, parentId: mathParent.id },
    { name: 'math-konkur', nameFA: 'ریاضی کنکور', slug: 'math-konkur', icon: '🏆', sortOrder: 5, parentId: mathParent.id },
  ];

  const catMap: Record<string, string> = {};
  for (const cat of mathCategories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    catMap[cat.slug] = created.id;
  }

  // ============ Courses & Lessons ============
  console.log('📚 ایجاد دوره‌ها و درس‌ها...');

  const coursesData = [
    // ===== ریاضی دهم =====
    {
      title: 'ریاضی دهم - مجموعه و احتمال',
      slug: 'math-10-set-probability',
      description: 'آموزش کامل فصل مجموعه‌ها، احتمال و آمار ریاضی دهم. این دوره شامل تمام مباحث فصل اول و دوم کتاب ریاضی دهم می‌باشد. با حل تمرین‌های متنوع و تست‌های کنکوری، مفاهیم را عمیق یاد بگیرید.',
      shortDesc: 'مجموعه‌ها، احتمال و آمار توصیفی پایه دهم',
      price: 890000,
      discountPrice: 690000,
      level: 'BEGINNER',
      status: 'PUBLISHED',
      isFeatured: true,
      categorySlug: 'math-10',
      lessons: [
        'مفهوم مجموعه و نمایش آن',
        'اجتماع، اشتراک و تفاضل مجموعه‌ها',
        'مجموعه‌های متناهی و نامتناهی',
        'ضرب دکارتی و رابطه',
        'آشنایی با احتمال',
        'فضای نمونه و پیشامد',
        'احتمال شرطی',
        'آمار توصیفی و نمودارها',
        'شاخص‌های مرکزی (میانگین، میانه، مد)',
        'حل تست‌های جامع فصل ۱ و ۲',
      ],
    },
    {
      title: 'ریاضی دهم - تابع',
      slug: 'math-10-function',
      description: 'آموزش جامع مبحث تابع در ریاضی دهم. از مفهوم اولیه تابع تا انواع توابع، دامنه و برد، و ترکیب توابع. با مثال‌های فراوان و حل تست کنکور.',
      shortDesc: 'مفهوم تابع، دامنه و برد، انواع توابع',
      price: 790000,
      level: 'BEGINNER',
      status: 'PUBLISHED',
      isFeatured: false,
      categorySlug: 'math-10',
      lessons: [
        'مفهوم تابع و نمایش آن',
        'دامنه و برد تابع',
        'تابع یک‌به‌یک و پوشا',
        'تابع خطی و نمودار آن',
        'تابع قدرمطلقی',
        'تابع جزءصحیح (براکت)',
        'ترکیب توابع',
        'تابع وارون',
        'حل تمرین‌ها و تست‌های ترکیبی',
      ],
    },
    {
      title: 'ریاضی دهم - معادله و نامعادله',
      slug: 'math-10-equation',
      description: 'آموزش کامل معادلات و نامعادلات درجه اول و دوم ریاضی دهم. شامل روش‌های حل، تحلیل نمودار، و کاربردها.',
      shortDesc: 'معادلات درجه اول و دوم، نامعادلات',
      price: 690000,
      level: 'BEGINNER',
      status: 'PUBLISHED',
      isFeatured: false,
      categorySlug: 'math-10',
      lessons: [
        'معادله درجه اول و حل آن',
        'معادله درجه دوم و دلتا',
        'رابطه ریشه‌ها و ضرایب (ویت)',
        'نامعادله درجه اول',
        'نامعادله درجه دوم',
        'معادلات گویا',
        'قدرمطلق در معادلات',
        'حل تست‌های کنکوری',
      ],
    },
    {
      title: 'ریاضی دهم - مثلثات مقدماتی',
      slug: 'math-10-trigonometry',
      description: 'آموزش مثلثات پایه دهم شامل نسبت‌های مثلثاتی، دایره مثلثاتی و اتحادهای اولیه. پایه‌ای ضروری برای یازدهم و کنکور.',
      shortDesc: 'نسبت‌های مثلثاتی و دایره مثلثاتی',
      price: 590000,
      level: 'BEGINNER',
      status: 'PUBLISHED',
      isFeatured: false,
      categorySlug: 'math-10',
      lessons: [
        'نسبت‌های مثلثاتی (sin, cos, tan)',
        'دایره مثلثاتی',
        'زوایای مهم (۳۰، ۴۵، ۶۰ درجه)',
        'اتحادهای مثلثاتی اولیه',
        'رابطه بین نسبت‌های مثلثاتی',
        'حل مثلث',
        'حل تمرین و تست',
      ],
    },

    // ===== ریاضی یازدهم =====
    {
      title: 'ریاضی یازدهم - مثلثات پیشرفته',
      slug: 'math-11-trigonometry-advanced',
      description: 'آموزش کامل مثلثات یازدهم شامل توابع مثلثاتی، معادلات مثلثاتی و اتحادهای پیشرفته. مهم‌ترین مبحث یازدهم برای کنکور.',
      shortDesc: 'توابع مثلثاتی، معادلات و اتحادهای پیشرفته',
      price: 990000,
      discountPrice: 790000,
      level: 'INTERMEDIATE',
      status: 'PUBLISHED',
      isFeatured: true,
      categorySlug: 'math-11',
      lessons: [
        'تابع سینوس و نمودار آن',
        'تابع کسینوس و نمودار آن',
        'تابع تانژانت و نمودار آن',
        'اتحاد جمع و تفاضل زوایا',
        'اتحاد زاویه دوبرابر',
        'اتحاد نیم‌زاویه',
        'تبدیل جمع به ضرب و بالعکس',
        'معادلات مثلثاتی ساده',
        'معادلات مثلثاتی پیشرفته',
        'نامعادلات مثلثاتی',
        'حل تست‌های کنکور سراسری',
      ],
    },
    {
      title: 'ریاضی یازدهم - توابع نمایی و لگاریتمی',
      slug: 'math-11-exponential-log',
      description: 'آموزش جامع توابع نمایی و لگاریتمی یازدهم. از مفاهیم پایه تا حل معادلات لگاریتمی و نمایی پیچیده.',
      shortDesc: 'تابع نمایی، لگاریتم و خواص آن‌ها',
      price: 890000,
      level: 'INTERMEDIATE',
      status: 'PUBLISHED',
      isFeatured: false,
      categorySlug: 'math-11',
      lessons: [
        'تابع نمایی و خواص آن',
        'نمودار تابع نمایی',
        'مفهوم لگاریتم',
        'خواص لگاریتم',
        'تغییر مبنای لگاریتم',
        'تابع لگاریتمی و نمودار آن',
        'معادلات نمایی',
        'معادلات لگاریتمی',
        'نامعادلات نمایی و لگاریتمی',
        'حل تست‌های کنکوری',
      ],
    },
    {
      title: 'ریاضی یازدهم - حد و پیوستگی',
      slug: 'math-11-limit-continuity',
      description: 'آموزش مبحث حد و پیوستگی یازدهم. مفهوم حد، قوانین حد، حدهای نامتناهی، و مفهوم پیوستگی.',
      shortDesc: 'مفهوم حد، محاسبه حد، پیوستگی توابع',
      price: 790000,
      level: 'INTERMEDIATE',
      status: 'PUBLISHED',
      isFeatured: true,
      categorySlug: 'math-11',
      lessons: [
        'مفهوم حد و تعریف شهودی',
        'قوانین حد (جمع، ضرب، تقسیم)',
        'حد چندجمله‌ای‌ها',
        'رفع ابهام 0/0',
        'حد توابع گویا',
        'حد توابع رادیکالی',
        'حد در بی‌نهایت',
        'حدهای مثلثاتی',
        'مفهوم پیوستگی',
        'انواع ناپیوستگی',
        'قضیه مقدار میانی',
        'حل تست‌های کنکور',
      ],
    },

    // ===== ریاضی دوازدهم =====
    {
      title: 'ریاضی دوازدهم - مشتق',
      slug: 'math-12-derivative',
      description: 'آموزش کامل مشتق ریاضی دوازدهم. از مفهوم مشتق تا کاربردها شامل بهینه‌سازی، نرخ تغییرات و رسم نمودار. مهم‌ترین مبحث کنکور.',
      shortDesc: 'مفهوم مشتق، قواعد مشتق‌گیری و کاربردها',
      price: 1290000,
      discountPrice: 990000,
      level: 'ADVANCED',
      status: 'PUBLISHED',
      isFeatured: true,
      categorySlug: 'math-12',
      lessons: [
        'مفهوم مشتق و نرخ تغییرات',
        'تعریف مشتق با حد',
        'مشتق توابع ساده (توانی)',
        'مشتق جمع و تفاضل',
        'مشتق حاصلضرب و خارج‌قسمت',
        'قاعده زنجیره‌ای',
        'مشتق توابع مثلثاتی',
        'مشتق توابع نمایی و لگاریتمی',
        'مشتق ضمنی',
        'مشتق مراتب بالاتر',
        'اکسترمم‌ها (بیشینه و کمینه)',
        'نقاط بحرانی و عطف',
        'رسم نمودار با مشتق',
        'مسائل بهینه‌سازی',
        'حل تست‌های کنکور سراسری',
      ],
    },
    {
      title: 'ریاضی دوازدهم - انتگرال',
      slug: 'math-12-integral',
      description: 'آموزش کامل انتگرال ریاضی دوازدهم. انتگرال نامعین، معین، روش‌های انتگرال‌گیری و محاسبه مساحت زیر منحنی.',
      shortDesc: 'انتگرال نامعین و معین، محاسبه مساحت',
      price: 1190000,
      discountPrice: 890000,
      level: 'ADVANCED',
      status: 'PUBLISHED',
      isFeatured: false,
      categorySlug: 'math-12',
      lessons: [
        'مفهوم انتگرال نامعین (پادمشتق)',
        'فرمول‌های اولیه انتگرال',
        'انتگرال توابع توانی',
        'انتگرال توابع مثلثاتی',
        'انتگرال توابع نمایی و لگاریتمی',
        'روش جانشانی (تغییر متغیر)',
        'انتگرال معین و مفهوم آن',
        'قضیه اساسی حساب دیفرانسیل',
        'محاسبه مساحت زیر منحنی',
        'مساحت بین دو منحنی',
        'حل تست‌های کنکور',
      ],
    },
    {
      title: 'ریاضی دوازدهم - هندسه تحلیلی و ماتریس',
      slug: 'math-12-analytic-geometry',
      description: 'آموزش هندسه تحلیلی و ماتریس ریاضی دوازدهم. معادله خط، مقاطع مخروطی، و عملیات ماتریسی.',
      shortDesc: 'معادله خط، مقاطع مخروطی، ماتریس و دترمینان',
      price: 990000,
      level: 'ADVANCED',
      status: 'PUBLISHED',
      isFeatured: false,
      categorySlug: 'math-12',
      lessons: [
        'معادله خط و شیب',
        'اشکال مختلف معادله خط',
        'فاصله نقطه از خط',
        'دایره و معادله آن',
        'بیضی و خواص آن',
        'هذلولی',
        'سهمی',
        'ماتریس و انواع آن',
        'عملیات روی ماتریس‌ها',
        'دترمینان ماتریس',
        'ماتریس وارون',
        'حل دستگاه معادلات با ماتریس',
        'حل تست‌های کنکور',
      ],
    },

    // ===== ریاضی نهایی =====
    {
      title: 'جمع‌بندی ریاضی نهایی دوازدهم',
      slug: 'math-final-12-summary',
      description: 'جمع‌بندی کامل ریاضی برای امتحان نهایی دوازدهم. مرور سریع تمام فصول، نکات مهم، حل نمونه سوالات نهایی سال‌های گذشته.',
      shortDesc: 'مرور کل کتاب + حل نمونه سوالات نهایی',
      price: 1490000,
      discountPrice: 1190000,
      level: 'ADVANCED',
      status: 'PUBLISHED',
      isFeatured: true,
      categorySlug: 'math-final',
      lessons: [
        'مرور فصل ۱: تابع (نکات کلیدی)',
        'مرور فصل ۲: مثلثات (فرمول‌های مهم)',
        'مرور فصل ۳: حد و پیوستگی',
        'مرور فصل ۴: مشتق و کاربردها',
        'مرور فصل ۵: انتگرال',
        'مرور فصل ۶: هندسه تحلیلی',
        'مرور فصل ۷: ماتریس و دترمینان',
        'حل نمونه سوال نهایی خرداد ۱۴۰۲',
        'حل نمونه سوال نهایی خرداد ۱۴۰۳',
        'حل نمونه سوال نهایی دی ۱۴۰۳',
        'نکات طلایی و سوالات تکراری',
        'آزمون شبیه‌ساز نهایی',
      ],
    },

    // ===== ریاضی کنکور =====
    {
      title: 'جمع‌بندی ریاضی کنکور تجربی',
      slug: 'math-konkur-tajrobi',
      description: 'دوره جامع جمع‌بندی ریاضی کنکور تجربی. مرور تمام مباحث دهم تا دوازدهم با تمرکز بر تست‌زنی سریع. شامل ۱۰ سال کنکور حل‌شده.',
      shortDesc: 'جمع‌بندی کامل ریاضی کنکور تجربی + حل ۱۰ سال کنکور',
      price: 2490000,
      discountPrice: 1890000,
      level: 'ADVANCED',
      status: 'PUBLISHED',
      isFeatured: true,
      categorySlug: 'math-konkur',
      lessons: [
        'تابع و انواع آن (مرور + تست)',
        'معادله و نامعادله (مرور + تست)',
        'مثلثات (مرور + تست)',
        'توابع نمایی و لگاریتمی (مرور + تست)',
        'حد و پیوستگی (مرور + تست)',
        'مشتق (مرور + تست)',
        'کاربرد مشتق (مرور + تست)',
        'انتگرال (مرور + تست)',
        'هندسه تحلیلی (مرور + تست)',
        'ماتریس و دترمینان (مرور + تست)',
        'احتمال و آمار (مرور + تست)',
        'حل کنکور ۱۳۹۸',
        'حل کنکور ۱۳۹۹',
        'حل کنکور ۱۴۰۰',
        'حل کنکور ۱۴۰۱',
        'حل کنکور ۱۴۰۲',
        'حل کنکور ۱۴۰۳',
        'تکنیک‌های تست‌زنی سریع',
        'مباحث پرتکرار و الگوهای سوال',
        'آزمون شبیه‌ساز کنکور (۱)',
        'آزمون شبیه‌ساز کنکور (۲)',
      ],
    },
    {
      title: 'جمع‌بندی ریاضی کنکور ریاضی',
      slug: 'math-konkur-riazi',
      description: 'دوره جامع جمع‌بندی ریاضیات کنکور رشته ریاضی. شامل ریاضی ۱، ۲، ۳ و هندسه. مناسب داوطلبان کنکور ریاضی و فیزیک.',
      shortDesc: 'جمع‌بندی ریاضیات کنکور رشته ریاضی + حل کنکور',
      price: 2890000,
      discountPrice: 2290000,
      level: 'ADVANCED',
      status: 'PUBLISHED',
      isFeatured: true,
      categorySlug: 'math-konkur',
      lessons: [
        'مجموعه و ترکیبیات (مرور + تست)',
        'تابع (مرور + تست)',
        'مثلثات کامل (مرور + تست)',
        'لگاریتم و نمایی (مرور + تست)',
        'حد و پیوستگی (مرور + تست)',
        'مشتق و کاربردها (مرور + تست)',
        'انتگرال نامعین و معین (مرور + تست)',
        'کاربرد انتگرال (مرور + تست)',
        'هندسه تحلیلی (مرور + تست)',
        'ماتریس و دترمینان (مرور + تست)',
        'اعداد مختلط (مرور + تست)',
        'دنباله و سری (مرور + تست)',
        'هندسه ۱ (مرور + تست)',
        'هندسه ۲ (مرور + تست)',
        'آنالیز ترکیبی و احتمال (مرور + تست)',
        'حل کنکور ۱۴۰۰ ریاضی',
        'حل کنکور ۱۴۰۱ ریاضی',
        'حل کنکور ۱۴۰۲ ریاضی',
        'حل کنکور ۱۴۰۳ ریاضی',
        'تکنیک‌های تست‌زنی سریع ریاضیات',
        'آزمون جامع شبیه‌ساز کنکور',
      ],
    },
  ];

  for (const courseData of coursesData) {
    const { lessons, categorySlug, ...courseFields } = courseData;

    const existing = await prisma.course.findUnique({ where: { slug: courseFields.slug } });
    if (existing) {
      console.log(`  ⏭️  دوره "${courseFields.title}" از قبل وجود دارد`);
      continue;
    }

    const course = await prisma.course.create({
      data: {
        ...courseFields,
        price: courseFields.price,
        discountPrice: courseFields.discountPrice || null,
        duration: lessons.length * 45 * 60, // هر درس ≈ ۴۵ دقیقه
        lessonsCount: lessons.length,
        categoryId: catMap[categorySlug],
      } as any,
    });

    // Create lessons
    for (let i = 0; i < lessons.length; i++) {
      await prisma.lesson.create({
        data: {
          title: lessons[i],
          sortOrder: i + 1,
          isFree: i === 0, // درس اول رایگان
          isPublished: true,
          courseId: course.id,
        },
      });
    }

    console.log(`  ✅ دوره "${courseFields.title}" با ${lessons.length} درس ایجاد شد`);
  }

  // ============ Quizzes ============
  console.log('📝 ایجاد آزمون‌های نمونه...');

  const quizzesData = [
    {
      title: 'آزمون ریاضی دهم - مجموعه و احتمال',
      slug: 'quiz-math-10-set-probability',
      description: 'آزمون تستی ۱۰ سوالی از مبحث مجموعه و احتمال ریاضی دهم',
      duration: 15 * 60,
      questions: [
        { question: 'اگر A = {1, 2, 3} و B = {2, 3, 4} باشد، A ∩ B چیست؟', optionA: '{1, 2, 3, 4}', optionB: '{2, 3}', optionC: '{1, 4}', optionD: '{1}', correctOption: 'B', explanation: 'اشتراک دو مجموعه شامل عناصر مشترک است' },
        { question: 'تعداد زیرمجموعه‌های مجموعه {a, b, c} چقدر است؟', optionA: '۳', optionB: '۶', optionC: '۸', optionD: '۹', correctOption: 'C', explanation: 'تعداد زیرمجموعه‌ها = 2^n = 2^3 = 8' },
        { question: 'اگر n(A) = 5 و n(B) = 3 و n(A ∩ B) = 2 باشد، n(A ∪ B) چقدر است؟', optionA: '۴', optionB: '۶', optionC: '۸', optionD: '۱۰', correctOption: 'B', explanation: 'n(A∪B) = n(A) + n(B) - n(A∩B) = 5 + 3 - 2 = 6' },
        { question: 'از بین اعداد ۱ تا ۱۰، احتمال انتخاب عدد زوج چقدر است؟', optionA: '۱/۲', optionB: '۱/۳', optionC: '۱/۵', optionD: '۲/۵', correctOption: 'A', explanation: 'اعداد زوج: 2,4,6,8,10 → 5/10 = 1/2' },
        { question: 'متمم مجموعه A نسبت به U کدام است؟', optionA: 'A ∩ U', optionB: 'U - A', optionC: 'A ∪ U', optionD: 'A - U', correctOption: 'B', explanation: 'متمم A شامل تمام عناصر U است که در A نیستند' },
      ],
    },
    {
      title: 'آزمون مشتق - ریاضی دوازدهم',
      slug: 'quiz-math-12-derivative',
      description: 'آزمون تستی از مبحث مشتق ویژه آمادگی کنکور',
      duration: 20 * 60,
      questions: [
        { question: 'مشتق تابع f(x) = 3x² + 2x - 1 کدام است؟', optionA: '6x + 2', optionB: '3x + 2', optionC: '6x - 1', optionD: '3x² + 2', correctOption: 'A', explanation: 'f\'(x) = 6x + 2 (قاعده توان)' },
        { question: 'مشتق تابع f(x) = sin(2x) کدام است؟', optionA: 'cos(2x)', optionB: '2cos(2x)', optionC: '-2cos(2x)', optionD: '2sin(2x)', correctOption: 'B', explanation: 'قاعده زنجیره‌ای: f\'(x) = cos(2x) × 2 = 2cos(2x)' },
        { question: 'اگر f(x) = eˣ باشد، f\'(0) چقدر است؟', optionA: '0', optionB: '1', optionC: 'e', optionD: '۲', correctOption: 'B', explanation: 'مشتق eˣ = eˣ و e⁰ = 1' },
        { question: 'مشتق f(x) = ln(x) در x = e کدام است؟', optionA: '1', optionB: '1/e', optionC: 'e', optionD: '0', correctOption: 'B', explanation: 'f\'(x) = 1/x → f\'(e) = 1/e' },
        { question: 'نقطه بحرانی تابع f(x) = x³ - 3x کدام است؟', optionA: 'x = 0', optionB: 'x = 1', optionC: 'x = ±1', optionD: 'x = 3', correctOption: 'C', explanation: 'f\'(x) = 3x² - 3 = 0 → x² = 1 → x = ±1' },
        { question: 'مشتق تابع f(x) = x.eˣ کدام است؟', optionA: 'eˣ', optionB: 'x.eˣ', optionC: '(1+x).eˣ', optionD: '(x-1).eˣ', correctOption: 'C', explanation: 'قاعده ضرب: f\'(x) = eˣ + x.eˣ = (1+x).eˣ' },
      ],
    },
    {
      title: 'آزمون جامع کنکور تجربی',
      slug: 'quiz-konkur-tajrobi-test',
      description: 'آزمون جامع ۱۰ سوالی شبیه‌ساز کنکور تجربی - ریاضیات',
      duration: 25 * 60,
      questions: [
        { question: 'حد تابع (x²-1)/(x-1) وقتی x به ۱ میل کند چقدر است؟', optionA: '0', optionB: '1', optionC: '2', optionD: 'وجود ندارد', correctOption: 'C', explanation: '(x²-1)/(x-1) = (x+1)(x-1)/(x-1) = x+1 → 1+1 = 2' },
        { question: 'انتگرال ∫2x dx کدام است؟', optionA: 'x² + C', optionB: '2x² + C', optionC: 'x + C', optionD: '2 + C', correctOption: 'A', explanation: '∫2x dx = 2.(x²/2) + C = x² + C' },
        { question: 'معادله خطی که از نقطه (1,2) می‌گذرد و شیب آن 3 است کدام است؟', optionA: 'y = 3x + 1', optionB: 'y = 3x - 1', optionC: 'y = 3x + 2', optionD: 'y = 3x - 2', correctOption: 'B', explanation: 'y - 2 = 3(x - 1) → y = 3x - 1' },
        { question: 'log₂(8) چقدر است؟', optionA: '2', optionB: '3', optionC: '4', optionD: '8', correctOption: 'B', explanation: '2³ = 8 → log₂(8) = 3' },
        { question: 'sin(30°) چقدر است؟', optionA: '√2/2', optionB: '√3/2', optionC: '1/2', optionD: '1', correctOption: 'C', explanation: 'sin(30°) = 1/2 از جدول مقادیر مثلثاتی' },
      ],
    },
  ];

  for (const quizData of quizzesData) {
    const existing = await prisma.quiz.findUnique({ where: { slug: quizData.slug } });
    if (existing) continue;

    await prisma.quiz.create({
      data: {
        title: quizData.title,
        slug: quizData.slug,
        description: quizData.description,
        duration: quizData.duration,
        isActive: true,
        questions: {
          create: quizData.questions.map((q, i) => ({ ...q, sortOrder: i })),
        },
      },
    });
    console.log(`  ✅ آزمون "${quizData.title}" با ${quizData.questions.length} سوال ایجاد شد`);
  }

  // ============ Discount Codes ============
  console.log('🎫 ایجاد کدهای تخفیف نمونه...');

  const discountCodes = [
    { code: 'WELCOME20', type: 'PERCENT' as const, value: 20, description: 'خوش‌آمدگویی - ۲۰٪ تخفیف', maxUses: 100 },
    { code: 'KONKUR50', type: 'FIXED' as const, value: 500000, description: 'تخفیف ویژه کنکور - ۵۰۰ هزار تومان', maxUses: 50, minAmount: 1000000 },
  ];

  for (const dc of discountCodes) {
    await prisma.discountCode.upsert({
      where: { code: dc.code },
      update: {},
      create: dc,
    });
    console.log(`  ✅ کد تخفیف "${dc.code}" ایجاد شد`);
  }

  // ============ Settings ============
  console.log('⚙️ ایجاد تنظیمات پیش‌فرض...');

  const settings = [
    // عمومی
    { key: 'site_name', value: 'آکادمی ریاضی', type: 'string', group: 'general' },
    { key: 'site_description', value: 'آموزش آنلاین ریاضیات دبیرستان و کنکور', type: 'string', group: 'general' },
    { key: 'site_logo', value: '', type: 'string', group: 'general' },
    { key: 'site_favicon', value: '', type: 'string', group: 'general' },
    { key: 'site_copyright', value: '© تمامی حقوق برای آکادمی ریاضی محفوظ است', type: 'string', group: 'general' },
    // بنر اصلی
    { key: 'hero_title', value: 'ریاضی رو ساده و عمیق یاد بگیر', type: 'string', group: 'hero' },
    { key: 'hero_subtitle', value: 'دوره‌های تخصصی ریاضیات دهم تا دوازدهم، آمادگی نهایی و کنکور با بهترین اساتید', type: 'string', group: 'hero' },
    { key: 'hero_search_placeholder', value: 'جستجوی دوره ریاضی...', type: 'string', group: 'hero' },
    { key: 'hero_btn_primary', value: 'مشاهده دوره‌ها', type: 'string', group: 'hero' },
    { key: 'hero_btn_secondary', value: 'ویدیو معرفی', type: 'string', group: 'hero' },
    // آمار
    { key: 'stats_students', value: '۵,۰۰۰+', type: 'string', group: 'stats' },
    { key: 'stats_courses', value: '۱۳', type: 'string', group: 'stats' },
    { key: 'stats_instructors', value: '۸', type: 'string', group: 'stats' },
    { key: 'stats_hours', value: '۴۵۰+', type: 'string', group: 'stats' },
    // بخش CTA
    { key: 'cta_badge', value: 'درس اول هر دوره رایگان', type: 'string', group: 'cta' },
    { key: 'cta_title', value: 'همین الان شروع کن، کنکور منتظر نمی‌مونه!', type: 'string', group: 'cta' },
    { key: 'cta_subtitle', value: 'با ثبت‌نام رایگان درس اول هر دوره رو ببین و بعد تصمیم بگیر', type: 'string', group: 'cta' },
    // تماس
    { key: 'contact_email', value: 'info@mathacademy.ir', type: 'string', group: 'contact' },
    { key: 'contact_phone', value: '021-91009100', type: 'string', group: 'contact' },
    { key: 'contact_address', value: 'تهران، خیابان انقلاب', type: 'string', group: 'contact' },
    // شبکه‌های اجتماعی
    { key: 'social_instagram', value: '', type: 'string', group: 'social' },
    { key: 'social_telegram', value: '', type: 'string', group: 'social' },
    { key: 'social_linkedin', value: '', type: 'string', group: 'social' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('✅ Seed با موفقیت انجام شد!');
  console.log('');
  console.log('📝 اطلاعات ورود ادمین:');
  console.log('   ایمیل: admin@example.com');
  console.log('   رمز عبور: Admin@123456');
}

main()
  .catch((e) => {
    console.error('❌ خطا در seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
