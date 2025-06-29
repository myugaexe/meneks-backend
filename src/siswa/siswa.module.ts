import { Module } from '@nestjs/common';
import { SiswaController } from './siswa.controller';
import { SiswaService } from './siswa.service';

@Module({
  controllers: [SiswaController],
  providers: [SiswaService],
})
export class SiswaModule {}
