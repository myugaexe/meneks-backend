import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import { CreatePresensiDto } from './dto/create-presensi.dto';

@Injectable()
export class PresensiService {
  async create(dto: CreatePresensiDto) {
    const { tanggal, waktu, status_hadir, catatan, pendaftaran_id, noted_by } = dto;

    console.log("DTO received:", dto); // 🟢 Tambahkan ini

    const { data, error } = await supabase
      .from('presensi')
      .insert([
        {
          tanggal,
          waktu,
          status_hadir,
          catatan,
          pendaftaran_id,
          noted_by,
        },
      ])
      .select()
      .single();

    console.log("Supabase insert response:", { data, error }); // 🟢 Tambahkan ini

    if (error) {
      console.error('Insert error:', error);
      throw new Error(error.message);
    }

    return data;
  }

  async findAll() {
    const { data, error } = await supabase.from('presensi').select('*');
    if (error) {
      console.error('Fetch error:', error);
      throw new Error(error.message);
    }
    return data;
  }
}

