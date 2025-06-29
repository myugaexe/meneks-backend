import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SiswaService } from './siswa.service';

@Controller('siswa')
export class SiswaController {
  constructor(private readonly siswaService: SiswaService) {}

@UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@Req() req) {
    const userId = req.user?.id || req.user?.userId; // Pastikan field ini sesuai JWT-mu
    return this.siswaService.getDashboardData(userId);
  }
}
