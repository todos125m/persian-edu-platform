'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Tag,
  Ticket,
  Check,
  X,
} from 'lucide-react';
import { useCartStore } from '@/store';
import { useAuthStore } from '@/store/authStore';
import { ordersService } from '@/services/ordersService';
import { formatPrice, toPersianNumber } from '@/lib/utils';
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, clearCart, totalPrice, totalDiscount, finalPrice } =
    useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const result = await ordersService.validateCoupon(couponCode.trim(), finalPrice());
      setAppliedCoupon({
        code: result.code,
        discountAmount: result.discountAmount,
        finalAmount: result.finalAmount,
      });
      toast.success('کد تخفیف اعمال شد');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'کد تخفیف نامعتبر است');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/cart');
      return;
    }

    if (items.length === 0) return;

    setIsCheckingOut(true);
    try {
      const courseIds = items.map((item) => item.id);
      const order = await ordersService.create(courseIds, appliedCoupon?.code);
      const payment = await ordersService.initiatePayment(order.id);
      clearCart();
      window.location.href = payment.paymentUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'خطا در ثبت سفارش');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-20 h-20 text-gray-300 mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">سبد خرید خالی است</h1>
        <p className="text-gray-500 mb-8">هنوز دوره‌ای به سبد خرید اضافه نکرده‌اید</p>
        <Link href="/courses">
          <Button size="lg">
            <ShoppingCart className="w-5 h-5 ml-2" />
            مشاهده دوره‌ها
          </Button>
        </Link>
      </div>
    );
  }

  const payableAmount = appliedCoupon ? appliedCoupon.finalAmount : finalPrice();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            سبد خرید ({toPersianNumber(items.length)} دوره)
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const hasDiscount =
                item.discountPrice && item.discountPrice < item.price;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/courses/${item.slug}`}
                    className="relative w-28 h-20 rounded-lg overflow-hidden bg-gray-200 shrink-0"
                  >
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600" />
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/courses/${item.slug}`}
                      className="font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>
                    <div className="mt-2 flex items-center gap-3">
                      {hasDiscount ? (
                        <>
                          <span className="font-bold text-primary-600">
                            {formatPrice(item.discountPrice!)}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(item.price)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-gray-900">
                          {item.price === 0 ? 'رایگان' : formatPrice(item.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="حذف"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Sidebar - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">خلاصه سفارش</h2>

              {/* Coupon Code */}
              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 text-green-700">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">کد {appliedCoupon.code} اعمال شد</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-green-600 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="کد تخفیف"
                      dir="ltr"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyCoupon}
                      isLoading={couponLoading}
                      className="whitespace-nowrap"
                    >
                      <Ticket className="w-4 h-4 ml-1" />
                      اعمال
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">جمع کل</span>
                  <span className="text-gray-900 font-medium">
                    {formatPrice(totalPrice())}
                  </span>
                </div>

                {totalDiscount() > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      تخفیف دوره
                    </span>
                    <span className="font-medium">
                      {formatPrice(totalDiscount())}
                    </span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Ticket className="w-4 h-4" />
                      کد تخفیف
                    </span>
                    <span className="font-medium">
                      {formatPrice(appliedCoupon.discountAmount)}
                    </span>
                  </div>
                )}

                <hr className="border-gray-200" />

                <div className="flex items-center justify-between text-base">
                  <span className="font-bold text-gray-900">مبلغ قابل پرداخت</span>
                  <span className="font-bold text-primary-600">
                    {formatPrice(payableAmount)}
                  </span>
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                className="mt-6"
                onClick={handleCheckout}
                isLoading={isCheckingOut}
              >
                <ShoppingBag className="w-5 h-5 ml-2" />
                تکمیل خرید
              </Button>

              <Link
                href="/courses"
                className="flex items-center justify-center gap-2 mt-3 py-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                ادامه خرید
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
