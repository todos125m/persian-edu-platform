'use client';

import Link from 'next/link';
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Send,
  Linkedin,
} from 'lucide-react';
import { useSettingsStore } from '@/store';

const footerLinks = {
  quickLinks: [
    { href: '/courses', label: 'همه دوره‌ها' },
    { href: '/categories', label: 'دسته‌بندی‌ها' },
    { href: '/about', label: 'درباره ما' },
    { href: '/contact', label: 'تماس با ما' },
  ],
  support: [
    { href: '/faq', label: 'سوالات متداول' },
    { href: '/terms', label: 'قوانین و مقررات' },
    { href: '/privacy', label: 'حریم خصوصی' },
    { href: '/refund', label: 'شرایط بازگشت وجه' },
  ],
  categories: [
    { href: '/categories/math-10', label: 'ریاضی دهم' },
    { href: '/categories/math-11', label: 'ریاضی یازدهم' },
    { href: '/categories/math-12', label: 'ریاضی دوازدهم' },
    { href: '/categories/math-final', label: 'ریاضی نهایی' },
    { href: '/categories/math-konkur', label: 'ریاضی کنکور' },
  ],
};

export function Footer() {
  const get = useSettingsStore((s) => s.get);
  const siteName = get('site_name', 'آکادمی');
  const siteLogo = get('site_logo');
  const copyright = get('site_copyright', `© تمامی حقوق برای ${siteName} محفوظ است`);
  const contactPhone = get('contact_phone', '021-1234-5678');
  const contactEmail = get('contact_email', 'info@academy.ir');
  const contactAddress = get('contact_address', 'تهران، خیابان آزادی');
  const socialInstagram = get('social_instagram');
  const socialTelegram = get('social_telegram');
  const socialLinkedin = get('social_linkedin');

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-6">
              {siteLogo ? (
                <img src={siteLogo} alt={siteName} className="h-10 w-10 object-contain rounded-xl" />
              ) : (
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              )}
              <span className="text-xl font-bold text-white">{siteName}</span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {get('site_description', 'آموزش آنلاین ریاضیات دبیرستان و کنکور با بهترین اساتید و تدریس مفهومی')}
            </p>
            <div className="flex gap-3">
              {socialInstagram && (
                <a
                  href={socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socialTelegram && (
                <a
                  href={socialTelegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </a>
              )}
              {socialLinkedin && (
                <a
                  href={socialLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {!socialInstagram && !socialTelegram && !socialLinkedin && (
                <>
                  <span className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Instagram className="w-5 h-5" />
                  </span>
                  <span className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </span>
                  <span className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Linkedin className="w-5 h-5" />
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4">دسترسی سریع</h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold mb-4">دسته‌بندی‌ها</h3>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">تماس با ما</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-sm">تلفن پشتیبانی</p>
                  <p className="text-white" dir="ltr">
                    {contactPhone}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-sm">ایمیل</p>
                  <p className="text-white" dir="ltr">
                    {contactEmail}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="text-gray-400 text-sm">آدرس</p>
                  <p className="text-white">{contactAddress}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            {copyright}
          </p>
          <div className="flex items-center gap-4">
            {footerLinks.support.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
