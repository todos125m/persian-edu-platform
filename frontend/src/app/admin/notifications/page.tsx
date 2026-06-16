'use client';

import { useState } from 'react';
import { Bell, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('INFO');
  const [link, setLink] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('عنوان و پیام الزامی هستند');
      return;
    }

    setSending(true);
    try {
      await api.post('/notifications/admin/send', {
        title: title.trim(),
        message: message.trim(),
        type,
        link: link.trim() || undefined,
      });
      toast.success('اعلان با موفقیت برای همه کاربران ارسال شد');
      setTitle('');
      setMessage('');
      setType('INFO');
      setLink('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در ارسال اعلان');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">ارسال اعلان</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <p className="text-gray-500 mb-6">
          اعلان ارسالی برای تمام کاربران فعال سیستم نمایش داده خواهد شد.
        </p>

        <form onSubmit={handleSend} className="space-y-4">
          <Input
            label="عنوان اعلان"
            placeholder="عنوان اعلان را وارد کنید..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            label="متن اعلان"
            placeholder="متن اعلان را وارد کنید..."
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="نوع اعلان"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={[
                { value: 'INFO', label: 'اطلاعیه' },
                { value: 'SUCCESS', label: 'موفقیت' },
                { value: 'WARNING', label: 'هشدار' },
                { value: 'ERROR', label: 'خطا' },
              ]}
            />

            <Input
              label="لینک (اختیاری)"
              placeholder="/courses/..."
              dir="ltr"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <Button type="submit" isLoading={sending}>
              <Send className="w-5 h-5 ml-2" />
              ارسال اعلان به همه کاربران
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
