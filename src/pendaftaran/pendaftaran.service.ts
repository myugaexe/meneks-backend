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
    // 1. Periksa apakah siswa sudah terdaftar di ekstrakurikuler ini (Business Rule)
    const { data: existing, error: fetchError } = await this.supabase
      .from('pendaftaran')
      .select('*')
      .eq('siswa_id', dto.siswa_id)
      .eq('eksul_id', dto.eksul_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new BadRequestException(fetchError.message);
    }

    if (existing) {
      throw new BadRequestException('Siswa sudah terdaftar di ekstrakurikuler ini.');
    }

    // 2. Periksa jumlah ekstrakurikuler yang sudah didaftarkan siswa
    const { count: registeredCount, error: countError } = await this.supabase
      .from('pendaftaran')
      .select('id', { count: 'exact' })
      .eq('siswa_id', dto.siswa_id);

    if (countError) {
      throw new BadRequestException(`Gagal menghitung pendaftaran siswa: ${countError.message}`);
    }

    if (registeredCount && registeredCount >= this.MAX_EKSTRA_REGISTRATIONS) {
      throw new BadRequestException(
        `Siswa sudah mendaftar ${this.MAX_EKSTRA_REGISTRATIONS} ekstrakurikuler dan tidak bisa mendaftar lebih banyak.`
      );
    }

    // 3. Ambil data periode dan kapasitas ekstrakurikuler yang akan didaftarkan
    const { data: ekskul, error: ekskulError } = await this.supabase
      .from('ekstra')
      .select('periode_start, periode_end, maxAnggota, JumlahAnggota')
      .eq('id', dto.eksul_id)
      .single();

    if (ekskulError) {
      throw new BadRequestException(`Gagal mengambil data ekstrakurikuler: ${ekskulError.message}`);
    }

    if (
      !ekskul ||
      !ekskul.periode_start ||
      !ekskul.periode_end ||
      ekskul.maxAnggota === undefined ||
      ekskul.JumlahAnggota === undefined
    ) {
      throw new BadRequestException('Data ekstrakurikuler tidak lengkap.');
    }

    // 4. Validasi apakah periode sudah berakhir (Business Rule)
    const today = new Date();
    const periodeEnd = new Date(ekskul.periode_end); // Ini akan bekerja dengan baik karena Supabase mengirimkan format ISO

    if (today > periodeEnd) {
      throw new BadRequestException('Pendaftaran sudah ditutup karena periode sudah berakhir.');
    }

    // 5. Validasi apakah kuota sudah penuh (Business Rule)
    if (ekskul.JumlahAnggota >= ekskul.maxAnggota) {
      throw new BadRequestException('Kuota ekstrakurikuler sudah penuh.');
    }

    // 6. Lanjutkan pendaftaran
    const { data, error } = await this.supabase
      .from('pendaftaran')
      .insert([
        {
          siswa_id: dto.siswa_id,
          eksul_id: dto.eksul_id,
          status: 'aktif',
          register_at: new Date().toTimeString().split(' ')[0], // <--- PERBAIKAN DI SINI!
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