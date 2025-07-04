import { Body, Controller, Get, Post } from '@nestjs/common';
import { PresensiService } from './presensi.service';
import { CreatePresensiDto } from './dto/create-presensi.dto';

@Controller('presensi')
export class PresensiController {
  constructor(private readonly presensiService: PresensiService) {}

  @Post()
  async create(@Body() dto: CreatePresensiDto) {
    return this.presensiService.create(dto);
  }

  @Get()
  async findAll() {
    return this.presensiService.findAll();
  }
}
