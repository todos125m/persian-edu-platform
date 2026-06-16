'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  BellOff,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Check,
  CheckCheck,
} from 'lucide-react';
import {
  notificationsService,
  Notification,
} from '@/services/notificationsService';
import { toast } from 'react-toastify';

// ---------- Persian relative time helper ----------

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

function toPersianNumber(n: number): string {
  return String(n)
    .split('')
    .map((d) => PERSIAN_DIGITS[Number(d)] ?? d)
    .join('');
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return 'لحظاتی پیش';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${toPersianNumber(diffMinutes)} دقیقه پیش`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${toPersianNumber(diffHours)} ساعت پیش`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${toPersianNumber(diffDays)} روز پیش`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${toPersianNumber(diffWeeks)} هفته پیش`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${toPersianNumber(diffMonths)} ماه پیش`;

  const diffYears = Math.floor(diffDays / 365);
  return `${toPersianNumber(diffYears)} سال پیش`;
}

// ---------- Type → icon / color mappings ----------

const TYPE_CONFIG: Record<
  Notification['type'],
  { icon: typeof Info; colorClass: string; bgClass: string }
> = {
  INFO: {
    icon: Info,
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-100',
  },
  SUCCESS: {
    icon: CheckCircle,
    colorClass: 'text-green-600',
    bgClass: 'bg-green-100',
  },
  WARNING: {
    icon: AlertTriangle,
    colorClass: 'text-yellow-600',
    bgClass: 'bg-yellow-100',
  },
  ERROR: {
    icon: XCircle,
    colorClass: 'text-red-600',
    bgClass: 'bg-red-100',
  },
};

// ---------- Component ----------

export default function DashboardNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationsService.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('خطا در دریافت اعلان‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      try {
        await notificationsService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
        toast.error('خطا در به‌روزرسانی اعلان');
      }
    }

    // Navigate if notification has a link
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllRead(true);
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('خطا در به‌روزرسانی اعلان‌ها');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">اعلان‌ها</h1>
            <p className="text-gray-500 text-sm mt-1">
              {unreadCount > 0
                ? `${toPersianNumber(unreadCount)} اعلان خوانده نشده`
                : 'همه اعلان‌ها خوانده شده‌اند'}
            </p>
          </div>
        </div>

        {/* Mark all as read */}
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAllRead}
            className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {markingAllRead ? (
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <CheckCheck className="w-4 h-4" />
            )}
            خواندن همه
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-sm animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <BellOff className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">اعلان جدیدی ندارید</p>
        </div>
      ) : (
        /* Notifications List */
        <div className="space-y-3">
          {notifications.map((notification) => {
            const config = TYPE_CONFIG[notification.type];
            const Icon = config.icon;

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-2xl p-5 shadow-sm transition-all cursor-pointer hover:shadow-md ${
                  !notification.isRead
                    ? 'bg-blue-50/40 border border-blue-100'
                    : 'border border-transparent'
                } ${notification.link ? 'hover:scale-[1.01]' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Type Icon */}
                  <div
                    className={`w-10 h-10 ${config.bgClass} rounded-xl flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${config.colorClass}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-bold text-gray-900 ${
                            !notification.isRead ? '' : 'font-medium'
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {/* Unread dot */}
                        {!notification.isRead && (
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0" />
                        )}
                      </div>

                      {/* Read status icon */}
                      <div className="shrink-0 mt-0.5">
                        {notification.isRead ? (
                          <CheckCheck className="w-4 h-4 text-gray-300" />
                        ) : (
                          <Check className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {notification.message}
                    </p>

                    <span className="text-xs text-gray-400 mt-2 block">
                      {timeAgo(notification.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
