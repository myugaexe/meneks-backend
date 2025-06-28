import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

jest.mock('@supabase/supabase-js', () => {
  return {
    createClient: jest.fn(() => ({
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({ data: [{ id: '123', email: 'test@example.com', name: 'Test' }], error: null }),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: '123',
          email: 'test@example.com',
          password: bcrypt.hashSync('password123', 10),
          role: 'user'
        },
        error: null,
      }),
    })),
  };
});

// test AuthService 

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // test SIGN UP

  describe('signup', () => {
    it('should signup a new user', async () => {
      const result = await service.signup('Test', 'test@example.com', 'password123');
      expect(result).toHaveProperty('id');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw error if insert fails', async () => {
      // paksa error mock
      const spy = jest.spyOn(service['supabase'], 'select').mockResolvedValueOnce({
        data: null,
        error: { message: 'Insert failed' },
      });

      await expect(service.signup('Test', 'test@example.com', 'password123')).rejects.toThrow('Insert failed');

      spy.mockRestore();
    });
  });

  // test SIGN IN
  describe('signin', () => {
  it('should signin a user with correct credentials', async () => {
  const fakeUser = {
    id: 1,
    email: 'test@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'user',
  };

  // Mock supabase chain: from().select().eq().single()
  const spy = jest
    .spyOn(service['supabase'], 'from')
    .mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: fakeUser,
            error: null,
          }),
        }),
      }),
    } as any); // gunakan `as any` untuk melewati TypeScript strict typing

  const result = await service.signin('test@example.com', 'password123');
  expect(result).toEqual({
    id: 1,
    email: 'test@example.com',
    role: 'user',
  });

  spy.mockRestore();
});

  });
});
