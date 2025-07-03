import { Module } from '@nestjs/common';
import { PendaftaranService } from './pendaftaran.service';
import { PendaftaranController } from './pendaftaran.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PendaftaranController],
  providers: [PendaftaranService],
})
export class PendaftaranModule {}
