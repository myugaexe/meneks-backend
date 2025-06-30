// form-pendaftaran.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { FormPendaftaranService } from './formPendaftaran.service';

@Controller('form-pendaftaran')
export class FormPendaftaranController {
  constructor(private readonly formPendaftaranService: FormPendaftaranService) {}

  @Get(':ekskulId')
  async getFormPendaftaran(
    @Param('ekskulId') ekskulId: string,
    @Query('userId') userId: string,
  ) {
    return this.formPendaftaranService.getFormPendaftaranByEkskulId(
      Number(ekskulId),
      Number(userId),
    );
  }
}
