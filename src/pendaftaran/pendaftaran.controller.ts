import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PendaftaranService } from './pendaftaran.service';
import { CreatePendaftaranDto } from './dto/create-pendaftaran.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('pendaftaran')
export class PendaftaranController {
  constructor(private readonly pendaftaranService: PendaftaranService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreatePendaftaranDto, @Request() req) {    
    const siswa_id = req.user.userId;

    if (!siswa_id) {
      throw new Error('User id tidak ditemukan dalam token');
    }
    
    return this.pendaftaranService.create({
      ...dto,
      siswa_id,
    });
  }
}
