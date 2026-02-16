'use client';

import { useState, useCallback, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { toPersianNumber } from '@/lib/utils';

type Operator = '+' | '-';

function generate(): { a: number; b: number; op: Operator; answer: number } {
  const op: Operator = Math.random() > 0.5 ? '+' : '-';
  let a = Math.floor(Math.random() * 20) + 1;
  let b = Math.floor(Math.random() * 15) + 1;

  // Ensure no negative results for subtraction
  if (op === '-' && b > a) {
    [a, b] = [b, a];
  }

  const answer = op === '+' ? a + b : a - b;
  return { a, b, op, answer };
}

interface CaptchaProps {
  onVerify: (verified: boolean) => void;
}

export default function Captcha({ onVerify }: CaptchaProps) {
  const [challenge, setChallenge] = useState(() => generate());
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const refresh = useCallback(() => {
    setChallenge(generate());
    setInput('');
    setStatus('idle');
    onVerify(false);
  }, [onVerify]);

  // Generate new challenge on mount (client-side only)
  useEffect(() => {
    setChallenge(generate());
  }, []);

  const handleChange = (value: string) => {
    setInput(value);

    // Convert Persian digits to English for comparison
    const normalized = value.replace(/[۰-۹]/g, (d) =>
      String.fromCharCode(d.charCodeAt(0) - 1728)
    );
    const num = parseInt(normalized, 10);

    if (value === '') {
      setStatus('idle');
      onVerify(false);
    } else if (num === challenge.answer) {
      setStatus('correct');
      onVerify(true);
    } else if (normalized.length >= String(challenge.answer).length) {
      setStatus('wrong');
      onVerify(false);
    } else {
      setStatus('idle');
      onVerify(false);
    }
  };

  const opSymbol = challenge.op === '+' ? '+' : '−';

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5 select-none min-w-[120px] justify-center">
        <span className="font-bold text-gray-800 text-lg tracking-wider" dir="ltr">
          {toPersianNumber(challenge.a)} {opSymbol} {toPersianNumber(challenge.b)} =
        </span>
      </div>

      <input
        type="text"
        inputMode="numeric"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="؟"
        className={`w-20 text-center px-3 py-2.5 border rounded-xl text-lg font-bold focus:outline-none focus:ring-2 transition-colors ${
          status === 'correct'
            ? 'border-green-400 bg-green-50 text-green-700 focus:ring-green-400'
            : status === 'wrong'
            ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-400'
            : 'border-gray-300 text-gray-800 focus:ring-primary-500'
        }`}
        dir="ltr"
      />

      <button
        type="button"
        onClick={refresh}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="سوال جدید"
      >
        <RefreshCw className="w-5 h-5" />
      </button>
    </div>
  );
}
