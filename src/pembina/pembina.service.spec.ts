import { Test, TestingModule } from '@nestjs/testing';
import { PembinaService } from './pembina.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Mock SupabaseClient secara global
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}));

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
      // Mocking user data
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
          // Mocking extracurriculars data
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            // Perhatikan bahwa `single()` tidak dipanggil pada kueri `ekstra`
            // Jadi, `select` langsung mengembalikan data atau error
            mockResolvedValueOnce: jest.fn().mockResolvedValueOnce({ // Untuk select().eq()
                data: [
                  { id: 101, nama: 'Pramuka', pembina_id: mockUserId, jadwal: { hari: 'Senin' } },
                  { id: 102, nama: 'Robotik', pembina_id: mockUserId, jadwal: { hari: 'Rabu' } },
                ],
                error: null,
              }),
          };
        }
        return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(),
            mockResolvedValueOnce: jest.fn(), // Fallback untuk method yang mungkin dipanggil
        };
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
      // Mock hanya untuk skenario user fetch gagal
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
        return { select: jest.fn().mockReturnThis() };
      });

      await expect(service.getDashboardData(mockUserId)).rejects.toThrow(
        'User not found',
      );
      expect(supabaseMock.from).toHaveBeenCalledWith('users');
    });

    it('should throw error if extracurriculars data fetch fails', async () => {
      // Mocking user data success
      // Mocking extracurriculars data failure
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
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            mockResolvedValueOnce: jest.fn().mockResolvedValueOnce({ // Untuk select().eq()
                data: null,
                error: { message: 'Extracurriculars not found' },
            }),
          };
        }
        return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(),
            mockResolvedValueOnce: jest.fn(),
        };
      });

      await expect(service.getDashboardData(mockUserId)).rejects.toThrow(
        'Extracurriculars not found',
      );
      expect(supabaseMock.from).toHaveBeenCalledWith('users');
      expect(supabaseMock.from).toHaveBeenCalledWith('ekstra');
    });
  });
});