import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Core Modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { VideosModule } from './modules/videos/videos.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AdminModule } from './modules/admin/admin.module';
import { InstructorModule } from './modules/instructor/instructor.module';
import { SettingsModule } from './modules/settings/settings.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { DiscountCodesModule } from './modules/discount-codes/discount-codes.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { SectionsModule } from './modules/sections/sections.module';
import { TagsModule } from './modules/tags/tags.module';
import { WishlistsModule } from './modules/wishlists/wishlists.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ContactModule } from './modules/contact/contact.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { InstallmentsModule } from './modules/installments/installments.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Schedule (Cron Jobs)
    ScheduleModule.forRoot(),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Database
    PrismaModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    CoursesModule,
    LessonsModule,
    VideosModule,
    OrdersModule,
    PaymentsModule,
    CategoriesModule,
    AdminModule,
    InstructorModule,
    SettingsModule,
    QuizzesModule,
    ReviewsModule,
    DiscountCodesModule,
    CertificatesModule,
    SectionsModule,
    TagsModule,
    WishlistsModule,
    NotificationsModule,
    ContactModule,
    TicketsModule,
    InstallmentsModule,
  ],
})
export class AppModule {}
