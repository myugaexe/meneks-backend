import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { CreatePendaftaranDto } from './dto/create-pendaftaran.dto';

@Injectable()
export class PendaftaranService {
  private supabase: SupabaseClient;
  private readonly MAX_EKSTRA_REGISTRATIONS = 2; // Batasan jumlah ekstra sebagai aturan bisnis

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  async create(dto: CreatePendaftaranDto) {
    // 1. Periksa apakah siswa sudah terdaftar di ekstrakurikuler ini
    const { data: existing, error: fetchError } = await this.supabase
      .from('pendaftaran')
      .select('*')
      .eq('siswa_id', dto.siswa_id)
      .eq('eksul_id', dto.eksul_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 berarti tidak ada data ditemukan, itu normal.
      throw new BadRequestException(fetchError.message);
    }

    if (existing) {
      throw new BadRequestException('Siswa sudah terdaftar di ekstrakurikuler ini.');
    }

    // 2. Periksa jumlah ekstrakurikuler yang sudah didaftarkan siswa
    const { count: registeredCount, error: countError } = await this.supabase
      .from('pendaftaran')
      .select('id', { count: 'exact' }) // Menggunakan count: 'exact' untuk mendapatkan jumlah total baris
      .eq('siswa_id', dto.siswa_id);

    if (countError) {
      throw new BadRequestException(`Gagal menghitung pendaftaran siswa: ${countError.message}`);
    }

    if (registeredCount && registeredCount >= this.MAX_EKSTRA_REGISTRATIONS) {
      throw new BadRequestException(
        `Siswa sudah mendaftar ${this.MAX_EKSTRA_REGISTRATIONS} ekstrakurikuler dan tidak bisa mendaftar lebih banyak.`
      );
    }

    // 3. Lanjutkan pendaftaran jika semua aturan bisnis terpenuhi
    const { data, error } = await this.supabase
      .from('pendaftaran')
      .insert([
        {
          siswa_id: dto.siswa_id,
          eksul_id: dto.eksul_id,
          status: 'aktif',
          register_at: new Date().toISOString().split('T')[0] + 'T' + new Date().toISOString().split('T')[1].replace('Z', ''), // Format ISO string tanpa 'Z'
        },
      ])
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }
}