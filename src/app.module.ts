import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config' 
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { PembinaModule } from './pembina/pembina.module'
import { EkstraModule } from './ekstra/ekstra.module' 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    AuthModule,
    PembinaModule,
    EkstraModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
