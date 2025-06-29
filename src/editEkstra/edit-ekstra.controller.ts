import {
  Controller,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common'
import { EditEkstraService } from './edit-ekstra.service'
import { UpdateEkstraDto } from './dto/update-ekstra.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('editEkstra') // URL base: /editEkstra
export class EditEkstraController {
  constructor(private readonly editEkstraService: EditEkstraService) {}

  @UseGuards(JwtAuthGuard)
  @Put(':id') // PUT /editEkstra/12
  async updateEkstra(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEkstraDto
  ) {
    return this.editEkstraService.update(id, dto)
  }
}
