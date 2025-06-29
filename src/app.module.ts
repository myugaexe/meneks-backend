import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PembinaModule } from './pembina/pembina.module';


@Module({
  imports: [AuthModule, PembinaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
