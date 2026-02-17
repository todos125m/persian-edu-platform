import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('certificates')
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  // Public: Verify certificate
  @Get('verify/:certificateNo')
  verify(@Param('certificateNo') certificateNo: string) {
    return this.certificatesService.verify(certificateNo);
  }

  // User: Get my certificates
  @Get('my')
  @UseGuards(JwtAuthGuard)
  myCertificates(@Req() req: any) {
    return this.certificatesService.findUserCertificates(req.user.userId);
  }

  // User: Issue certificate
  @Post('issue/:courseId')
  @UseGuards(JwtAuthGuard)
  issue(@Req() req: any, @Param('courseId') courseId: string) {
    return this.certificatesService.issue(req.user.userId, courseId);
  }

  // Admin: Get all
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.certificatesService.adminFindAll(+page, +limit);
  }
}
