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

  // SIGNUP
  async signup(name: string, email:string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await this.supabase
    .from('users')
    .insert([
      {
        name,
        email,  
        password: hashedPassword,
        role: 'user',
      },
    ])
    .select();

    if (error) throw new Error(error.message);

    return data[0];
  }

  // SIGNIN
  async signin(email: string, password: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) throw new Error('Invalid credentials');

    const match = await bcrypt.compare(password, data.password);
    if (!match) throw new Error('Invalid credentials');

    return {
      id: data.id,
      email: data.email,
      role: data.role,
    };
  }
}
