import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class PembinaService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async getDashboardData(userId: string) {
    // ambil usernya berdasarkan id
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('id, name, role, nomorInduk')
      .eq('id', userId)
      .single();

    if (userError) throw new Error(userError.message);

    // ambil ekstrakurikuler yang dikelola pembina ini
    const { data: extracurriculars, error: ekskulError } = await this.supabase
      .from('ekstra')
      .select(`
            *,
            jadwal (
            *
            )
        `)
      .eq('pembina_id', userId);

    if (ekskulError) throw new Error(ekskulError.message);

    return {
      user,
      extracurriculars,
    };
  }
}
