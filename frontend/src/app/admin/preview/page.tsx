'use client';

import { useState } from 'react';
import { Eye, Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const viewports = [
  { key: 'desktop', label: 'دسکتاپ', icon: Monitor, width: '100%' },
  { key: 'tablet', label: 'تبلت', icon: Tablet, width: '768px' },
  { key: 'mobile', label: 'موبایل', icon: Smartphone, width: '375px' },
];

export default function AdminPreviewPage() {
  const [activeViewport, setActiveViewport] = useState('desktop');
  const selectedViewport = viewports.find((v) => v.key === activeViewport)!;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Eye className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">پیش‌نمایش فروشگاه</h1>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          باز کردن در تب جدید
        </a>
      </div>

      {/* Viewport Switcher */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {viewports.map((vp) => (
          <button
            key={vp.key}
            onClick={() => setActiveViewport(vp.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              activeViewport === vp.key
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            )}
          >
            <vp.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{vp.label}</span>
          </button>
        ))}
      </div>

      {/* iframe Preview */}
      <div className="flex justify-center">
        <div
          className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg transition-all duration-300"
          style={{ width: selectedViewport.width, maxWidth: '100%' }}
        >
          <iframe
            src="/"
            className="w-full border-0"
            style={{ height: 'calc(100vh - 250px)' }}
            title="پیش‌نمایش فروشگاه"
          />
        </div>
      </div>
    </div>
  );
}
