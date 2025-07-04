// form-pendaftaran.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FormPendaftaranService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  async getById(id: number) {
    const { data, error } = await this.supabase
      .from('ekstra')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException(error.message);
    }

    if (!data) {
      throw new NotFoundException('Ekstrakurikuler tidak ditemukan');
    }

    return data;
  }

  async getAll() {
    const { data, error } = await this.supabase
      .from('ekstra')
      .select('*');

    if (error) {
      throw new NotFoundException(error.message);
    }

    return data;
  }
  
  async getFormPendaftaranByEkskulId(ekskulId: number, userId: number) {
    // Ambil data ekskul
    const { data: ekstrakurikuler, error: ekskulError } = await this.supabase
      .from('ekstra')
      .select('*')
      .eq('id', ekskulId)
      .single();

    if (ekskulError) {
      throw new NotFoundException(`Ekstrakurikuler tidak ditemukan: ${ekskulError.message}`);
    }

    // Ambil profil siswa
    const { data: profile, error: profileError } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new NotFoundException(`Profil siswa tidak ditemukan: ${profileError.message}`);
    }

    return {
      ekstrakurikuler,
      profile,
    };
  }
}
