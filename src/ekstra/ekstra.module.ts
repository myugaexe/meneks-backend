// src/ekstra/ekstra.module.ts
import { Module } from '@nestjs/common'
import { EkstraService } from './ekstra.service'
import { EkstraController } from './ekstra.controller'

@Module({
  controllers: [EkstraController],
  providers: [EkstraService],
})
export class EkstraModule {}
