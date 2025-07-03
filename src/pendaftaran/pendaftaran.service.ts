import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { CreatePendaftaranDto } from './dto/create-pendaftaran.dto';

@Injectable()
export class PendaftaranService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  async create(dto: CreatePendaftaranDto) {    
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

    const { data, error } = await this.supabase
      .from('pendaftaran')
      .insert([
        {
          siswa_id: dto.siswa_id,
          eksul_id: dto.eksul_id,
          status: 'aktif',
          register_at: new Date().toISOString().split('T')[1].replace('Z', ''),
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
