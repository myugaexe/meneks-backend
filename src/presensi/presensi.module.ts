import { Module } from '@nestjs/common';
import { PresensiController } from './presensi.controller';
import { PresensiService } from './presensi.service';

@Module({
  controllers: [PresensiController],
  providers: [PresensiService],
})
export class PresensiModule {}
