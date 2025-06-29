import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private supabase;

  constructor() {
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
    .select();

  if (error) throw new Error(error.message);

  return data[0];
}


  // SIGNIN LOGIC
  async signin(email: string, password: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // Check if user exists
    if (error || !data) throw new Error('Invalid credentials');
    // Check if password matches
    const passwordMatch = await bcrypt.compare(password, data.password);
    if (!passwordMatch) throw new Error('Wrong password');

    return {
      id: data.id,
      email: data.email,
      role: data.role,
    };
  }
}
