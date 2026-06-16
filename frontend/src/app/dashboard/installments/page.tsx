'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { installmentsService, InstallmentPlan } from '@/services/installmentsService';
import Badge from '@/components/ui/Badge';
import { formatPrice, toPersianNumber } from '@/lib/utils';

const statusConfig: Record<string, { label: string; variant: any }> = {
  ACTIVE: { label: 'فعال', variant: 'info' },
  COMPLETED: { label: 'تکمیل شده', variant: 'success' },
  OVERDUE: { label: 'معوق', variant: 'danger' },
  CANCELLED: { label: 'لغو شده', variant: 'neutral' },
};

const installmentStatusConfig: Record<string, { label: string; variant: any; icon: any }> = {
  PENDING: { label: 'در انتظار پرداخت', variant: 'warning', icon: Clock },
  SUCCESS: { label: 'پرداخت شده', variant: 'success', icon: CheckCircle },
  FAILED: { label: 'ناموفق', variant: 'danger', icon: AlertCircle },
  CANCELLED: { label: 'لغو', variant: 'neutral', icon: AlertCircle },
};

export default function InstallmentsPage() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['my-installments'],
    queryFn: () => installmentsService.getMyPlans(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">اقساط من</h1>
          <p className="text-sm text-gray-500 mt-1">
            پیگیری و پرداخت اقساط دوره‌ها
          </p>
        </div>
      </div>

      {!plans?.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            اقساطی وجود ندارد
          </h3>
          <p className="text-gray-500">
            شما هنوز خریدی با پرداخت اقساطی انجام نداده‌اید
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {plans.map((plan: InstallmentPlan) => {
            const st = statusConfig[plan.status];
            const courseNames = plan.order.items
              .map((i) => i.course.title)
              .join('، ');

            return (
              <div
                key={plan.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Plan Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{courseNames}</h3>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      سفارش {plan.order.orderNumber}
                    </span>
                    <span>
                      مبلغ کل: {formatPrice(Number(plan.totalAmount))}
                    </span>
                    <span>
                      پیش‌پرداخت: {formatPrice(Number(plan.downPayment))}
                    </span>
                    <span>
                      {toPersianNumber(plan.paidInstallments)} از{' '}
                      {toPersianNumber(plan.totalInstallments)} قسط پرداخت شده
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{
                        width: `${(plan.paidInstallments / plan.totalInstallments) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Installments List */}
                <div className="divide-y divide-gray-50">
                  {plan.installments.map((inst) => {
                    const instStatus = installmentStatusConfig[inst.status];
                    const InstIcon = instStatus.icon;
                    const isPastDue =
                      inst.status === 'PENDING' &&
                      new Date(inst.dueDate) < new Date();

                    return (
                      <div
                        key={inst.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <InstIcon
                            className={`w-5 h-5 ${
                              inst.status === 'SUCCESS'
                                ? 'text-green-500'
                                : isPastDue
                                ? 'text-red-500'
                                : 'text-gray-400'
                            }`}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              قسط {toPersianNumber(inst.installmentNumber)}
                            </p>
                            <p className="text-xs text-gray-400">
                              سررسید:{' '}
                              {new Date(inst.dueDate).toLocaleDateString(
                                'fa-IR',
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-gray-900">
                            {formatPrice(Number(inst.amount))}
                          </span>
                          <Badge
                            variant={
                              isPastDue ? 'danger' : instStatus.variant
                            }
                          >
                            {isPastDue ? 'معوق' : instStatus.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
