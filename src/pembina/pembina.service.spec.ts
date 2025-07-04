import { Test, TestingModule } from '@nestjs/testing';
import { PembinaService } from './pembina.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Mock SupabaseClient secara global
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(), // from akan di-mock secara dinamis di beforeEach atau dalam setiap tes
  })),
}));

// Mock process.env
const mockProcessEnv = {
  SUPABASE_URL: 'http://mock.supabase.url',
  SUPABASE_SERVICE_ROLE_KEY: 'mock-key',
};

// Mock the global process object
const OLD_ENV = process.env;
beforeEach(() => {
  jest.resetModules(); // This is important to clear the cache of `process.env`
  process.env = { ...OLD_ENV, ...mockProcessEnv };
});

afterAll(() => {
  process.env = OLD_ENV; // Restore old env
});

describe('PembinaService', () => {
  let service: PembinaService;
  let supabaseMock: jest.Mocked<SupabaseClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PembinaService],
    }).compile();

    service = module.get<PembinaService>(PembinaService);
    // Dapatkan instance mock Supabase yang sebenarnya
    supabaseMock = (createClient as jest.Mock).mock.results[0].value;
    jest.clearAllMocks(); // Bersihkan mock setelah mendapatkan instance
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardData', () => {
    const mockUserId = 'pembina123'; // Menggunakan string karena userId di PembinaService adalah string

    it('should return dashboard data for a supervisor successfully', async () => {
      // Mocking user data and extracurriculars data
      (supabaseMock.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          // Untuk 'users', kita menggunakan .single()
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValueOnce({
              data: {
                id: mockUserId,
                name: 'Budi Santoso',
                role: 'pembina',
                nomorInduk: 'PBN001',
              },
              error: null,
            }),
          };
        } else if (tableName === 'ekstra') {
          // Untuk 'ekstra', kita TIDAK menggunakan .single() di service,
          // jadi select().eq() harus langsung me-resolve promise dengan { data: [], error: null }
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValueOnce({ // Perhatikan perubahannya di sini
              data: [
                { id: 101, nama: 'Pramuka', pembina_id: mockUserId, jadwal: { hari: 'Senin' } },
                { id: 102, nama: 'Robotik', pembina_id: mockUserId, jadwal: { hari: 'Rabu' } },
              ],
              error: null,
            }),
          };
        }
        // Fallback jika ada tabel lain yang dipanggil tanpa ekspektasi
        throw new Error(`Unexpected table name: ${tableName}`);
      });

      // Panggil service method
      const result = await service.getDashboardData(mockUserId);

      // Verifikasi output yang diharapkan
      expect(result).toBeDefined();
      expect(result.user).toEqual({
        id: mockUserId,
        name: 'Budi Santoso',
        role: 'pembina',
        nomorInduk: 'PBN001',
      });
      expect(result.extracurriculars).toEqual([
        { id: 101, nama: 'Pramuka', pembina_id: mockUserId, jadwal: { hari: 'Senin' } },
        { id: 102, nama: 'Robotik', pembina_id: mockUserId, jadwal: { hari: 'Rabu' } },
      ]);

      // Verifikasi interaksi Supabase
      expect(supabaseMock.from).toHaveBeenCalledTimes(2); // Sekali untuk 'users', sekali untuk 'ekstra'
      expect(supabaseMock.from).toHaveBeenCalledWith('users');
      expect(supabaseMock.from).toHaveBeenCalledWith('ekstra');
    });

    it('should throw error if user data fetch fails', async () => {
      (supabaseMock.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValueOnce({
              data: null,
              error: { message: 'User not found' },
            }),
          };
        }
        // Pastikan mock untuk tabel lain tidak mengganggu jika dipanggil secara tidak sengaja
        return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            // Tidak perlu single() atau mockResolvedValueOnce di sini jika tidak relevan
            // Atau, tambahkan throw jika panggilan ke tabel ini tidak diharapkan
        };
      });

      await expect(service.getDashboardData(mockUserId)).rejects.toThrow(
        'User not found',
      );
      expect(supabaseMock.from).toHaveBeenCalledWith('users');
    });

    it('should throw error if extracurriculars data fetch fails', async () => {
      (supabaseMock.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValueOnce({
              data: {
                id: mockUserId,
                name: 'Budi Santoso',
                role: 'pembina',
                nomorInduk: 'PBN001',
              },
              error: null,
            }),
          };
        } else if (tableName === 'ekstra') {
          // Untuk 'ekstra', langsung mengembalikan error karena tidak ada .single()
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValueOnce({ // Perhatikan perubahannya di sini
              data: null,
              error: { message: 'Extracurriculars not found' },
            }),
          };
        }
        throw new Error(`Unexpected table name: ${tableName}`);
      });

      await expect(service.getDashboardData(mockUserId)).rejects.toThrow(
        'Extracurriculars not found',
      );
      expect(supabaseMock.from).toHaveBeenCalledWith('users');
      expect(supabaseMock.from).toHaveBeenCalledWith('ekstra');
    });
  });
});