import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config' 
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { PembinaModule } from './pembina/pembina.module'
import { EkstraModule } from './ekstra/ekstra.module' 
import { SiswaModule } from './siswa/siswa.module'
import { EditEkstraModule } from './editEkstra/edit-ekstra.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    AuthModule,
    PembinaModule,
    EkstraModule,
    SiswaModule,
    EditEkstraModule 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
