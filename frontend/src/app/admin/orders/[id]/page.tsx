'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ShoppingCart,
  User,
  CreditCard,
  Package,
  Hash,
  Mail,
  Phone,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Ban,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { formatPrice, toJalali, toPersianNumber } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Breadcrumb from '@/components/admin/Breadcrumb';
import { toast } from 'react-toastify';

const statusConfig: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' | 'info'; icon: React.ReactNode }
> = {
  PENDING: { label: 'در انتظار پرداخت', variant: 'warning', icon: <Clock className="w-5 h-5" /> },
  PAID: { label: 'پرداخت شده', variant: 'success', icon: <CheckCircle className="w-5 h-5" /> },
  FAILED: { label: 'ناموفق', variant: 'danger', icon: <XCircle className="w-5 h-5" /> },
  REFUNDED: { label: 'بازگشت وجه', variant: 'info', icon: <RefreshCw className="w-5 h-5" /> },
  CANCELLED: { label: 'لغو شده', variant: 'neutral', icon: <Ban className="w-5 h-5" /> },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin', 'order', orderId],
    queryFn: () => adminService.getOrder(orderId),
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('کپی شد');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-4 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-4 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">سفارش یافت نشد</h2>
        <Button onClick={() => router.push('/admin/orders')} variant="outline">
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت به لیست سفارش‌ها
        </Button>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.PENDING;

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              سفارش {order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {toJalali(order.createdAt)}
            </p>
          </div>
        </div>
        <Badge variant={status.variant} className="text-sm px-4 py-1.5 gap-2">
          {status.icon}
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              آیتم‌های سفارش
            </h2>
            <div className="space-y-3">
              {order.items?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {toPersianNumber(index + 1)}
                    </span>
                    <span className="font-medium text-gray-900">
                      {item.course?.title || 'دوره حذف شده'}
                    </span>
                  </div>
                  <span className="font-medium text-gray-700">
                    {formatPrice(Number(item.price))}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>جمع کل</span>
                <span>{formatPrice(Number(order.totalAmount))}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>تخفیف</span>
                  <span>- {formatPrice(Number(order.discountAmount))}</span>
                </div>
              )}
              {(order as any).couponCode && (
                <div className="flex justify-between text-blue-600">
                  <span>کد تخفیف</span>
                  <span dir="ltr" className="font-mono">{(order as any).couponCode}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                <span>مبلغ نهایی</span>
                <span>{formatPrice(Number(order.finalAmount))}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {order.payment && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-600" />
                اطلاعات پرداخت
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  label="درگاه پرداخت"
                  value={order.payment.gateway || '-'}
                />
                <InfoRow
                  label="وضعیت پرداخت"
                  value={order.payment.status || '-'}
                />
                {order.payment.refId && (
                  <InfoRow
                    label="شماره پیگیری"
                    value={order.payment.refId}
                    copyable
                    onCopy={() => copyToClipboard(order.payment!.refId!)}
                  />
                )}
                {order.payment.cardNumber && (
                  <InfoRow
                    label="شماره کارت"
                    value={order.payment.cardNumber}
                    dir="ltr"
                  />
                )}
                {order.payment.paidAt && (
                  <InfoRow
                    label="تاریخ پرداخت"
                    value={toJalali(order.payment.paidAt)}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              اطلاعات مشتری
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-lg font-bold">
                  {order.user?.firstName?.[0] || '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {order.user?.firstName} {order.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{order.user?.email}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span dir="ltr">{order.user?.email}</span>
                </div>
                {(order.user as any)?.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span dir="ltr">{(order.user as any).phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Hash className="w-5 h-5 text-primary-600" />
              خلاصه سفارش
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">شماره سفارش</span>
                <span className="font-mono text-gray-900" dir="ltr">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">تعداد آیتم</span>
                <span className="text-gray-900">{toPersianNumber(order.items?.length || 0)} دوره</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">تاریخ ثبت</span>
                <span className="text-gray-900">{toJalali(order.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">وضعیت</span>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <Button
            fullWidth
            variant="outline"
            onClick={() => router.push('/admin/orders')}
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            بازگشت به لیست
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  copyable,
  onCopy,
  dir,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
  dir?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="flex items-center justify-between">
        <p className="font-medium text-gray-900 text-sm" dir={dir}>
          {value}
        </p>
        {copyable && (
          <button
            onClick={onCopy}
            className="text-gray-400 hover:text-primary-600 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
