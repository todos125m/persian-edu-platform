'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, Plus, Trash2, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import { adminService } from '@/services/adminService';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function AdminDiscountCodesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'PERCENT' as 'PERCENT' | 'FIXED',
    value: 10,
    maxUses: '',
    minAmount: '',
    expiresAt: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'discount-codes', page],
    queryFn: () => adminService.getDiscountCodes({ page, limit: 10 }),
  });

  const createMutation = useMutation({
    mutationFn: (codeData: any) => adminService.createDiscountCode(codeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'discount-codes'] });
      toast.success('کد تخفیف ایجاد شد');
      resetForm();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'خطا در ایجاد کد تخفیف'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminService.updateDiscountCode(id, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'discount-codes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteDiscountCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'discount-codes'] });
      toast.success('کد تخفیف حذف شد');
      setDeletingId(null);
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setFormData({ code: '', description: '', type: 'PERCENT', value: 10, maxUses: '', minAmount: '', expiresAt: '' });
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.value) {
      toast.error('کد و مقدار الزامی است');
      return;
    }
    createMutation.mutate({
      code: formData.code.toUpperCase(),
      description: formData.description || undefined,
      type: formData.type,
      value: formData.value,
      maxUses: formData.maxUses ? +formData.maxUses : undefined,
      minAmount: formData.minAmount ? +formData.minAmount : undefined,
      expiresAt: formData.expiresAt || undefined,
    });
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData({ ...formData, code });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('کد کپی شد');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Ticket className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">کدهای تخفیف</h1>
            <p className="text-gray-500 text-sm mt-1">ایجاد و مدیریت کدهای تخفیف</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 ml-2" />
          کد جدید
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">در حال بارگذاری...</div>
        ) : !data?.data?.length ? (
          <div className="p-12 text-center text-gray-500">هیچ کد تخفیفی یافت نشد</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">کد</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">نوع</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">مقدار</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">استفاده</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">انقضا</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">وضعیت</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.data.map((code: any) => (
                <tr key={code.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm font-bold">{code.code}</code>
                      <button onClick={() => copyCode(code.code)} className="text-gray-400 hover:text-gray-600">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {code.type === 'PERCENT' ? 'درصدی' : 'مبلغ ثابت'}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold">
                    {code.type === 'PERCENT'
                      ? `${Number(code.value)}٪`
                      : `${Number(code.value).toLocaleString('fa-IR')} تومان`}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {code.usedCount}/{code.maxUses || '∞'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {code.expiresAt
                      ? new Date(code.expiresAt).toLocaleDateString('fa-IR')
                      : 'بدون انقضا'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={code.isActive ? 'success' : 'danger'}>
                      {code.isActive ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMutation.mutate({ id: code.id, isActive: code.isActive })}
                      >
                        {code.isActive ? 'غیرفعال' : 'فعال'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => setDeletingId(code.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showForm} onClose={resetForm} title="ایجاد کد تخفیف جدید">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">کد تخفیف</label>
            <div className="flex gap-2">
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="مثلاً SALE20"
                dir="ltr"
                className="flex-1"
              />
              <Button variant="outline" onClick={generateRandomCode} className="whitespace-nowrap">
                تولید خودکار
              </Button>
            </div>
          </div>

          <Textarea
            label="توضیحات (اختیاری)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="نوع تخفیف"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PERCENT' | 'FIXED' })}
              options={[
                { value: 'PERCENT', label: 'درصدی' },
                { value: 'FIXED', label: 'مبلغ ثابت (تومان)' },
              ]}
            />
            <Input
              label={formData.type === 'PERCENT' ? 'درصد تخفیف' : 'مبلغ تخفیف (تومان)'}
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: +e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="حداکثر استفاده (اختیاری)"
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              placeholder="نامحدود"
            />
            <Input
              label="حداقل مبلغ سفارش (اختیاری)"
              type="number"
              value={formData.minAmount}
              onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
              placeholder="بدون محدودیت"
            />
          </div>

          <Input
            label="تاریخ انقضا (اختیاری)"
            type="date"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
          />

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSubmit} isLoading={createMutation.isPending} className="flex-1">
              ایجاد کد تخفیف
            </Button>
            <Button variant="outline" onClick={resetForm}>
              انصراف
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="حذف کد تخفیف"
        message="آیا از حذف این کد تخفیف اطمینان دارید؟"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
