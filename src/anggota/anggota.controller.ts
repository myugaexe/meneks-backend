import { Controller, Get, Param } from '@nestjs/common';
import { AnggotaService } from './anggota.service';

@Controller('anggota')
export class AnggotaController {
  constructor(private readonly anggotaService: AnggotaService) {}

  // GET /anggota/ekskul/1
  @Get('ekskul/:id')
  findAnggotaByEkskul(@Param('id') ekskulId: string) {
    return this.anggotaService.findByEkskul(+ekskulId);
  }
}
