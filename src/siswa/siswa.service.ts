import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SiswaService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async getDashboardData(userId: number) {
    // 1. Get user
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('id, name, role, nomorInduk')
      .eq('id', userId)
      .single();

    if (userError) throw new Error(`User fetch error: ${userError.message}`);

    // 2. Get all extracurriculars with schedule AND supervisor/users data
    // String select dinormalisasi menjadi satu baris yang ringkas
    const { data: allExtracurriculars, error: ekskulError } = await this.supabase
      .from('ekstra')
      .select(`*, jadwal (hari, waktuMulai, waktuSelesai), pembina:users (id, name)`);

    if (ekskulError) throw new Error(`Ekskul fetch error: ${ekskulError.message}`);

    // 3. Get registered extracurriculars for this student
    // String select dinormalisasi menjadi satu baris yang ringkas
    const { data: myRegistrations, error: daftarError } = await this.supabase
      .from('pendaftaran')
      .select(`id, status, register_at, ekstra (*, jadwal (hari, waktuMulai, waktuSelesai), pembina:users (id, name))`)
      .eq('siswa_id', userId);

    if (daftarError) throw new Error(`Daftar fetch error: ${daftarError.message}`);

    return {
      user,
      allExtracurriculars,
      myExtracurriculars: myRegistrations,
    };
  }
}