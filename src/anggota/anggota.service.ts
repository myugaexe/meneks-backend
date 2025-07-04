import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';

@Injectable()
export class AnggotaService {
  async findByEkskul(ekskulId: number) {
    const { data, error } = await supabase
      .from('pendaftaran')
      .select(`
        id,
        siswa_id,
        status,
        register_at,
        users (
          id,
          name,
          nomorInduk
        )
      `)
      .eq('eksul_id', ekskulId);

    if (error) {
      console.error('Fetch anggota error:', error);
      throw new Error(error.message);
    }

    return data;
  }
}
