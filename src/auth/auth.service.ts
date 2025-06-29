import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private supabase;

  constructor(private readonly jwtService: JwtService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  
  // SIGNUP LOGIC
  async signup(nomorInduk: string, name: string, email: string, password: string) {
    // Validasi panjang nomorInduk harus tepat 7 digit
    if (!/^\d{7}$/.test(nomorInduk.toString())) {
      throw new Error('Invalid Identification number');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await this.supabase
      .from('users')
      .insert([
        {
          nomorInduk,
          name,
          email,
          password: hashedPassword,
          role: 'siswa',
        },
      ])
      .select()
      .single();

    if (error || !data) throw new Error(error.message);

    // Buat token langsung supaya user tidak perlu login ulang
    const payload = {
      sub: data.id,
      email: data.email,
      role: data.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        nomorInduk: data.nomorInduk,
        role: data.role,
      }
    };
  }

  // SIGNIN LOGIC
  async signin(email: string, password: string) {
  const { data, error } = await this.supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

    if (error || !data) throw new Error('Invalid credentials');

    const passwordMatch = await bcrypt.compare(password, data.password);
    if (!passwordMatch) throw new Error('Wrong password');

    // buat token
    const payload = {
      sub: data.id,
      email: data.email,
      role: data.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        nomorInduk: data.nomorInduk,
        role: data.role,
      }
    };
  }

}
