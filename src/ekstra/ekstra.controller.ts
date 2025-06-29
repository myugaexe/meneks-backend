// src/ekstra/ekstra.controller.ts
import { Body, Controller, Post } from '@nestjs/common'
import { CreateEkstraDto } from './dto/create-ekstra.dto'
import { EkstraService } from './ekstra.service'

@Controller('ekstra')
export class EkstraController {
  constructor(private readonly ekstraService: EkstraService) {}

  @Post()
  async create(@Body() dto: CreateEkstraDto) {
    return this.ekstraService.create(dto)
  }
}
