import { Module } from '@nestjs/common';
import { PembinaController } from './pembina.controller';
import { PembinaService } from './pembina.service';

@Module({
  controllers: [PembinaController],
  providers: [PembinaService],
})
export class PembinaModule {}
