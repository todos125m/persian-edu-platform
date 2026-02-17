import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  // Public: Get active quizzes
  async findActive(page = 1, limit = 12, courseId?: string) {
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };
    if (courseId) where.courseId = courseId;

    const [quizzes, total] = await Promise.all([
      this.prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          course: { select: { title: true, slug: true } },
          _count: { select: { questions: true, attempts: true } },
        },
      }),
      this.prisma.quiz.count({ where }),
    ]);

    return {
      data: quizzes,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // Public: Get quiz by slug (without correct answers)
  async findBySlug(slug: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { slug },
      include: {
        course: { select: { title: true, slug: true } },
        questions: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            question: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            sortOrder: true,
          },
        },
      },
    });
    if (!quiz) throw new NotFoundException('آزمون یافت نشد');
    return quiz;
  }

  // User: Start/submit quiz attempt
  async submitAttempt(
    userId: string,
    quizId: string,
    answers: { questionId: string; selectedOption: string }[],
    timeTaken: number,
  ) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz) throw new NotFoundException('آزمون یافت نشد');
    if (!quiz.isActive) throw new BadRequestException('این آزمون غیرفعال است');

    const questionsMap = new Map(quiz.questions.map((q) => [q.id, q]));
    let correctAnswers = 0;

    const answerRecords = answers.map((a) => {
      const question = questionsMap.get(a.questionId);
      if (!question) throw new BadRequestException('سوال نامعتبر');
      const isCorrect = question.correctOption === a.selectedOption;
      if (isCorrect) correctAnswers++;
      return {
        questionId: a.questionId,
        selectedOption: a.selectedOption,
        isCorrect,
      };
    });

    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        totalQuestions,
        correctAnswers,
        timeTaken,
        finishedAt: new Date(),
        answers: { create: answerRecords },
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                question: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                correctOption: true,
                explanation: true,
              },
            },
          },
        },
      },
    });

    return attempt;
  }

  // User: Get my attempts
  async findUserAttempts(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [attempts, total] = await Promise.all([
      this.prisma.quizAttempt.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          quiz: { select: { title: true, slug: true } },
        },
      }),
      this.prisma.quizAttempt.count({ where: { userId } }),
    ]);

    return {
      data: attempts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // User: Get single attempt result
  async findAttempt(attemptId: string, userId: string) {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: { id: attemptId, userId },
      include: {
        quiz: { select: { title: true, slug: true } },
        answers: {
          include: {
            question: {
              select: {
                question: true,
                optionA: true,
                optionB: true,
                optionC: true,
                optionD: true,
                correctOption: true,
                explanation: true,
              },
            },
          },
        },
      },
    });
    if (!attempt) throw new NotFoundException('نتیجه آزمون یافت نشد');
    return attempt;
  }

  // ============ Admin ============

  async adminFindAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [quizzes, total] = await Promise.all([
      this.prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          course: { select: { title: true } },
          _count: { select: { questions: true, attempts: true } },
        },
      }),
      this.prisma.quiz.count({ where }),
    ]);

    return {
      data: quizzes,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminCreate(data: {
    title: string;
    slug: string;
    description?: string;
    duration?: number;
    courseId?: string;
    questions: {
      question: string;
      optionA: string;
      optionB: string;
      optionC: string;
      optionD: string;
      correctOption: string;
      explanation?: string;
    }[];
  }) {
    const existing = await this.prisma.quiz.findUnique({ where: { slug: data.slug } });
    if (existing) throw new BadRequestException('اسلاگ تکراری است');

    return this.prisma.quiz.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        duration: data.duration || 0,
        courseId: data.courseId || null,
        questions: {
          create: data.questions.map((q, i) => ({ ...q, sortOrder: i })),
        },
      },
      include: {
        questions: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { questions: true } },
      },
    });
  }

  async adminUpdate(id: string, data: {
    title?: string;
    slug?: string;
    description?: string;
    duration?: number;
    courseId?: string;
    isActive?: boolean;
  }) {
    return this.prisma.quiz.update({
      where: { id },
      data,
    });
  }

  async adminDelete(id: string) {
    return this.prisma.quiz.delete({ where: { id } });
  }

  // Admin: Add question to quiz
  async adminAddQuestion(quizId: string, data: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
    explanation?: string;
  }) {
    const count = await this.prisma.quizQuestion.count({ where: { quizId } });
    return this.prisma.quizQuestion.create({
      data: { ...data, quizId, sortOrder: count },
    });
  }

  // Admin: Update question
  async adminUpdateQuestion(questionId: string, data: {
    question?: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctOption?: string;
    explanation?: string;
  }) {
    return this.prisma.quizQuestion.update({
      where: { id: questionId },
      data,
    });
  }

  // Admin: Delete question
  async adminDeleteQuestion(questionId: string) {
    return this.prisma.quizQuestion.delete({ where: { id: questionId } });
  }
}
