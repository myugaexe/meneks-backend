import { Module } from '@nestjs/common'
import { EditEkstraService } from './edit-ekstra.service'
import { EditEkstraController } from './edit-ekstra.controller'

@Module({
  controllers: [EditEkstraController],
  providers: [EditEkstraService],
})
export class EditEkstraModule {}
