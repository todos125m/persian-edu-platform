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

  const categories = [
    { name: 'programming', nameFA: 'برنامه‌نویسی', slug: 'programming', icon: '💻', sortOrder: 1 },
    { name: 'web-development', nameFA: 'طراحی وب', slug: 'web-development', icon: '🌐', sortOrder: 2 },
    { name: 'mobile', nameFA: 'موبایل', slug: 'mobile', icon: '📱', sortOrder: 3 },
    { name: 'data-science', nameFA: 'علم داده', slug: 'data-science', icon: '📊', sortOrder: 4 },
    { name: 'ai-ml', nameFA: 'هوش مصنوعی', slug: 'ai-ml', icon: '🤖', sortOrder: 5 },
    { name: 'devops', nameFA: 'دواپس', slug: 'devops', icon: '⚙️', sortOrder: 6 },
    { name: 'database', nameFA: 'پایگاه داده', slug: 'database', icon: '🗃️', sortOrder: 7 },
    { name: 'security', nameFA: 'امنیت', slug: 'security', icon: '🔒', sortOrder: 8 },
    { name: 'design', nameFA: 'طراحی', slug: 'design', icon: '🎨', sortOrder: 9 },
    { name: 'business', nameFA: 'کسب و کار', slug: 'business', icon: '💼', sortOrder: 10 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // ============ Settings ============
  console.log('⚙️ ایجاد تنظیمات پیش‌فرض...');

  const settings = [
    { key: 'site_name', value: 'آکادمی آموزش', type: 'string', group: 'general' },
    { key: 'site_description', value: 'پلتفرم آموزش آنلاین فارسی', type: 'string', group: 'general' },
    { key: 'contact_email', value: 'info@example.com', type: 'string', group: 'contact' },
    { key: 'contact_phone', value: '021-12345678', type: 'string', group: 'contact' },
    { key: 'social_instagram', value: '', type: 'string', group: 'social' },
    { key: 'social_telegram', value: '', type: 'string', group: 'social' },
    { key: 'social_linkedin', value: '', type: 'string', group: 'social' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
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
