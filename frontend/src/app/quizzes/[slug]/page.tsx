'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ClipboardCheck, Clock, CheckCircle2, XCircle, ArrowRight, Trophy, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';

type QuizState = 'intro' | 'active' | 'result';

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const slug = params.slug as string;

  const [state, setState] = useState<QuizState>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [result, setResult] = useState<any>(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', slug],
    queryFn: async () => {
      const { data } = await api.get(`/quizzes/slug/${slug}`);
      return data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post(`/quizzes/${quiz.id}/submit`, payload);
      return data;
    },
    onSuccess: (data) => {
      setResult(data);
      setState('result');
    },
    onError: () => toast.error('خطا در ثبت آزمون'),
  });

  // Timer
  useEffect(() => {
    if (state !== 'active' || !quiz?.duration || quiz.duration === 0) return;
    if (timeLeft <= 0 && startTime > 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [state, timeLeft]);

  const handleStart = () => {
    if (!isAuthenticated) {
      toast.error('ابتدا وارد حساب کاربری خود شوید');
      router.push('/login');
      return;
    }
    setState('active');
    setStartTime(Date.now());
    if (quiz?.duration) setTimeLeft(quiz.duration);
  };

  const selectAnswer = (questionId: string, option: string) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = useCallback(() => {
    if (!quiz) return;
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const answerArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption,
    }));
    submitMutation.mutate({ answers: answerArray, timeTaken });
  }, [quiz, answers, startTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        آزمون یافت نشد
      </div>
    );
  }

  const questions = quiz.questions || [];

  // ============ INTRO ============
  if (state === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ClipboardCheck className="w-10 h-10 text-primary-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-3">{quiz.title}</h1>
            {quiz.description && <p className="text-gray-600 mb-6">{quiz.description}</p>}

            <div className="flex items-center justify-center gap-6 mb-8 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <ClipboardCheck className="w-4 h-4" />
                {questions.length} سوال
              </span>
              {quiz.duration > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.round(quiz.duration / 60)} دقیقه
                </span>
              )}
            </div>

            <Button onClick={handleStart} size="lg" className="px-12">
              شروع آزمون
            </Button>

            <button
              onClick={() => router.push('/quizzes')}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mx-auto"
            >
              <ArrowRight className="w-4 h-4" />
              بازگشت به لیست آزمون‌ها
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ ACTIVE ============
  if (state === 'active') {
    const question = questions[currentQ];
    if (!question) return null;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Top bar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              سوال {currentQ + 1} از {questions.length}
            </span>
            <div className="flex items-center gap-4">
              {/* Progress */}
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all"
                  style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                />
              </div>
              {quiz.duration > 0 && (
                <span className={`text-sm font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>
                  <Clock className="w-4 h-4 inline ml-1" />
                  {formatTime(timeLeft)}
                </span>
              )}
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 leading-relaxed">
              {currentQ + 1}. {question.question}
            </h2>

            <div className="space-y-3 mb-8">
              {[
                { key: 'A', label: 'الف', value: question.optionA },
                { key: 'B', label: 'ب', value: question.optionB },
                { key: 'C', label: 'ج', value: question.optionC },
                { key: 'D', label: 'د', value: question.optionD },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => selectAnswer(question.id, opt.key)}
                  className={`w-full text-right p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    answers[question.id] === opt.key
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      answers[question.id] === opt.key
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="flex-1">{opt.value}</span>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
              >
                سوال قبلی
              </Button>

              {/* Question dots */}
              <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
                {questions.map((_: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                      i === currentQ
                        ? 'bg-primary-600 text-white'
                        : answers[questions[i].id]
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {currentQ === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  isLoading={submitMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ثبت آزمون
                </Button>
              ) : (
                <Button onClick={() => setCurrentQ(currentQ + 1)}>
                  سوال بعدی
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ RESULT ============
  if (state === 'result' && result) {
    const scoreColor = result.score >= 70 ? 'text-green-600' : result.score >= 40 ? 'text-yellow-600' : 'text-red-600';

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Score Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mb-8">
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${scoreColor}`} />
            <h1 className="text-2xl font-black text-gray-900 mb-2">نتیجه آزمون</h1>
            <p className="text-gray-500 mb-6">{quiz.title}</p>

            <div className={`text-6xl font-black mb-2 ${scoreColor}`}>{result.score}%</div>
            <p className="text-gray-600 mb-6">
              {result.correctAnswers} پاسخ صحیح از {result.totalQuestions} سوال
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-8">
              <span>
                زمان: {Math.floor(result.timeTaken / 60)}:{(result.timeTaken % 60).toString().padStart(2, '0')} دقیقه
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setState('intro');
                  setAnswers({});
                  setCurrentQ(0);
                  setResult(null);
                }}
              >
                <RotateCcw className="w-4 h-4 ml-2" />
                آزمون مجدد
              </Button>
              <Button onClick={() => router.push('/quizzes')}>بازگشت به آزمون‌ها</Button>
            </div>
          </div>

          {/* Answers Review */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">بررسی پاسخ‌ها</h2>
            <div className="space-y-4">
              {result.answers?.map((answer: any, i: number) => (
                <div
                  key={answer.id}
                  className={`rounded-xl p-4 border-2 ${
                    answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {answer.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="font-medium text-gray-900">
                      {i + 1}. {answer.question?.question}
                    </p>
                  </div>

                  <div className="mr-7 text-sm space-y-1">
                    <p>
                      <span className="text-gray-500">پاسخ شما: </span>
                      <span className={answer.isCorrect ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
                        {answer.question?.[`option${answer.selectedOption}`]}
                      </span>
                    </p>
                    {!answer.isCorrect && (
                      <p>
                        <span className="text-gray-500">پاسخ صحیح: </span>
                        <span className="text-green-700 font-bold">
                          {answer.question?.[`option${answer.question?.correctOption}`]}
                        </span>
                      </p>
                    )}
                    {answer.question?.explanation && (
                      <p className="text-gray-600 mt-2 bg-white/70 rounded-lg p-2">
                        {answer.question.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
