import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { CreateEkstraDto } from './dto/create-ekstra.dto'
import { supabase } from '../supabase/supabase.client'

@Injectable()
  export class EkstraService {
    async findAll() {
    const { data, error } = await supabase
      .from('ekstra')
      .select(`
        *,
        jadwal (
          id,
          hari,
          waktuMulai,
          waktuSelesai
        )
      `)

    if (error) {
      console.error('Gagal ambil daftar ekstra:', error)
      throw new InternalServerErrorException('Gagal mengambil data ekstrakurikuler: ' + error.message)
    }

    return data
  }
  
  async create(dto: CreateEkstraDto) {    
    const { data: jadwal, error: jadwalError } = await supabase
      .from('jadwal')
      .insert([
        {
          hari: dto.schedules[0].day,
          waktuMulai: dto.schedules[0].startTime,
          waktuSelesai: dto.schedules[0].endTime,
        },
      ])
      .select()
      .single()

    if (jadwalError) {
      console.error('Gagal simpan jadwal:', jadwalError)
      throw new InternalServerErrorException('Gagal menyimpan jadwal: ' + jadwalError.message)
    }

    // 2. Gunakan jadwal.id sebagai foreign key ke ekstra
    const { data: ekstra, error: ekstraError } = await supabase
    .from('ekstra')
    .insert([
      {
        name: dto.name,
        description: dto.description,
        periode_start: dto.registrationStart,
        periode_end: dto.registrationEnd,
        maxAnggota: dto.maxMembers,
        jadwal_id: jadwal.id,
        pembina_id: dto.pembinaId, 
      },
    ])
    .select()
    .single()


    if (ekstraError) {
      console.error('Gagal simpan ekstra:', ekstraError)
      throw new InternalServerErrorException('Gagal menyimpan ekstra: ' + ekstraError.message)
    }

    return {
      message: 'Ekstrakurikuler dan jadwal berhasil dibuat',
      ekstra,
      jadwal,
    }
    
  }
}
