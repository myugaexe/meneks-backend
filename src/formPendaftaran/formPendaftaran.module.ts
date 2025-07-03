import { Module } from '@nestjs/common';
import { FormPendaftaranController } from './formPendaftaran.controller';
import { FormPendaftaranService } from './formPendaftaran.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [FormPendaftaranController],
  providers: [FormPendaftaranService],
  exports: [FormPendaftaranService],
})
export class FormPendaftaranModule {}
