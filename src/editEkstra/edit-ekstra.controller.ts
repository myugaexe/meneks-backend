import {
  Controller,
  Put,
  Get,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { EditEkstraService } from './edit-ekstra.service';
import { UpdateEkstraDto } from './dto/update-ekstra.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('editEkstra')
export class EditEkstraController {
  constructor(private readonly editEkstraService: EditEkstraService) {}

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateEkstra(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEkstraDto,
  ) {
    return this.editEkstraService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getEkstra(@Param('id', ParseIntPipe) id: number) {
    return this.editEkstraService.getOne(id);
  }
}
