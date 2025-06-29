import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { PembinaService } from './pembina.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pembina')
export class PembinaController {
  constructor(private readonly pembinaService: PembinaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@Req() req) {
    const userId = req.user.userId; 
    return this.pembinaService.getDashboardData(userId);
  }
}
