import { Controller, Get, Query } from '@nestjs/common';
import { PembinaService } from './pembina.service';

@Controller('pembina')
export class PembinaController {
  constructor(private readonly pembinaService: PembinaService) {}

  @Get('dashboard')
  async getDashboard(@Query('userId') userId: string) {
    return this.pembinaService.getDashboardData(userId);
  }
}
