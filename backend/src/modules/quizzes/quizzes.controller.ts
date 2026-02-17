import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('quizzes')
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  // ============ Public ============

  @Get()
  findActive(
    @Query('page') page = 1,
    @Query('limit') limit = 12,
    @Query('courseId') courseId?: string,
  ) {
    return this.quizzesService.findActive(+page, +limit, courseId);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.quizzesService.findBySlug(slug);
  }

  // ============ User ============

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  submit(
    @Req() req: any,
    @Param('id') quizId: string,
    @Body() body: { answers: { questionId: string; selectedOption: string }[]; timeTaken: number },
  ) {
    return this.quizzesService.submitAttempt(req.user.userId, quizId, body.answers, body.timeTaken);
  }

  @Get('my/attempts')
  @UseGuards(JwtAuthGuard)
  myAttempts(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.quizzesService.findUserAttempts(req.user.userId, +page, +limit);
  }

  @Get('my/attempts/:id')
  @UseGuards(JwtAuthGuard)
  myAttemptDetail(@Req() req: any, @Param('id') attemptId: string) {
    return this.quizzesService.findAttempt(attemptId, req.user.userId);
  }

  // ============ Admin ============

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search?: string) {
    return this.quizzesService.adminFindAll(+page, +limit, search);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminCreate(@Body() body: any) {
    return this.quizzesService.adminCreate(body);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminUpdate(@Param('id') id: string, @Body() body: any) {
    return this.quizzesService.adminUpdate(id, body);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminDelete(@Param('id') id: string) {
    return this.quizzesService.adminDelete(id);
  }

  @Post('admin/:quizId/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminAddQuestion(@Param('quizId') quizId: string, @Body() body: any) {
    return this.quizzesService.adminAddQuestion(quizId, body);
  }

  @Patch('admin/questions/:questionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminUpdateQuestion(@Param('questionId') questionId: string, @Body() body: any) {
    return this.quizzesService.adminUpdateQuestion(questionId, body);
  }

  @Delete('admin/questions/:questionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminDeleteQuestion(@Param('questionId') questionId: string) {
    return this.quizzesService.adminDeleteQuestion(questionId);
  }
}
