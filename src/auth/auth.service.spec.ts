import { AuthService } from './auth.service';

describe('AuthService simple test', () => {
  let service: AuthService;

  beforeEach(() => {
    // cukup buat instance manual, tidak perlu TestingModule
    service = new AuthService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // contoh hanya validasi hash password
  it('should hash password correctly (simplified)', async () => {
    const bcrypt = require('bcrypt');
    const plain = 'password123';
    const hashed = await bcrypt.hash(plain, 10);
    const match = await bcrypt.compare(plain, hashed);
    expect(match).toBe(true);
  });
});
