import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common'
import { UpdateEkstraDto } from './dto/update-ekstra.dto'
import { supabase } from '../supabase/supabase.client'

@Injectable()
export class EditEkstraService {
  async update(ekstraId: number, dto: UpdateEkstraDto) {
    // Update jadwal terlebih dahulu
    const { data: oldEkstra, error: findError } = await supabase
      .from('ekstra')
      .select('jadwal_id')
      .eq('id', ekstraId)
      .single()

    if (findError || !oldEkstra) {
      throw new NotFoundException('Ekstrakurikuler tidak ditemukan')
    }

    const jadwalId = oldEkstra.jadwal_id

    const { error: jadwalError } = await supabase
      .from('jadwal')
      .update({
        hari: dto.schedules[0].day,
        waktuMulai: dto.schedules[0].startTime,
        waktuSelesai: dto.schedules[0].endTime,
      })
      .eq('id', jadwalId)

    if (jadwalError) {
      throw new InternalServerErrorException('Gagal mengupdate jadwal: ' + jadwalError.message)
    }

    // Update ekstra
    const { error: ekstraError } = await supabase
      .from('ekstra')
      .update({
        name: dto.name,
        description: dto.description,
        maxAnggota: dto.maxMembers,
        periode_start: dto.registrationStart,
        periode_end: dto.registrationEnd,
      })
      .eq('id', ekstraId)

    if (ekstraError) {
      throw new InternalServerErrorException('Gagal mengupdate ekstra: ' + ekstraError.message)
    }

    return { message: 'Ekstrakurikuler berhasil diperbarui' }
  }
}
