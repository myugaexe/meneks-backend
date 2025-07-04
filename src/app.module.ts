import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config' 
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { PembinaModule } from './pembina/pembina.module'
import { EkstraModule } from './ekstra/ekstra.module' 
import { SiswaModule } from './siswa/siswa.module'
import { EditEkstraModule } from './editEkstra/edit-ekstra.module'
import { PendaftaranModule } from './pendaftaran/pendaftaran.module'
import { FormPendaftaranModule } from './formPendaftaran/formPendaftaran.module'
import { PresensiModule } from './presensi/presensi.module'
import { AnggotaModule } from './anggota/anggota.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    AuthModule,
    PembinaModule,
    EkstraModule,
    SiswaModule,
    EditEkstraModule,
    PendaftaranModule,
    FormPendaftaranModule,
    PresensiModule,
    AnggotaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
