import { Test, TestingModule } from '@nestjs/testing';
import { SiswaService } from './siswa.service';
import { createClient } from '@supabase/supabase-js';

// Mock SupabaseClient secara global untuk tes ini
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(), // Default mock for single()
    })),
  })),
}));

describe('SiswaService', () => {
  let service: SiswaService;
  let supabaseMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SiswaService],
    }).compile();

    service = module.get<SiswaService>(SiswaService);
    // Dapatkan instance mock Supabase yang sebenarnya
    supabaseMock = (createClient as jest.Mock)();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Bersihkan mock setelah setiap tes
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardData', () => {
    const mockUserId = 1;

    it('should return dashboard data successfully', async () => {
      // Mocking data yang akan dikembalikan oleh Supabase
      supabaseMock.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => ({
          data: {
            id: mockUserId,
            name: 'John Doe',
            role: 'siswa',
            nomorInduk: '12345',
          },
          error: null,
        })),
      });

      // Mock untuk allExtracurriculars
      supabaseMock.from.mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(() => ({
              data: {
                id: mockUserId,
                name: 'John Doe',
                role: 'siswa',
                nomorInduk: '12345',
              },
              error: null,
            })),
          };
        } else if (tableName === 'ekstra') {
          return {
            select: jest.fn(() => ({
              data: [{ id: 101, nama: 'Basket', jadwal: {}, pembina: {} }],
              error: null,
            })),
          };
        } else if (tableName === 'pendaftaran') {
          return {
            select: jest.fn(() => ({
              data: [{ id: 201, status: 'aktif', ekstra: { id: 102, nama: 'Futsal' } }],
              error: null,
            })),
            eq: jest.fn().mockReturnThis(),
          };
        }
        return { select: jest.fn().mockReturnThis() }; // Fallback
      });

      const result = await service.getDashboardData(mockUserId);

      expect(result).toBeDefined();
      expect(result.user).toEqual({
        id: mockUserId,
        name: 'John Doe',
        role: 'siswa',
        nomorInduk: '12345',
      });
      expect(result.allExtracurriculars).toEqual([
        { id: 101, nama: 'Basket', jadwal: {}, pembina: {} },
      ]);
      expect(result.myExtracurriculars).toEqual([
        { id: 201, status: 'aktif', ekstra: { id: 102, nama: 'Futsal' } },
      ]);
      expect(supabaseMock.from).toHaveBeenCalledTimes(3); // users, ekstra, pendaftaran
      expect(supabaseMock.from).toHaveBeenCalledWith('users');
      expect(supabaseMock.from).toHaveBeenCalledWith('ekstra');
      expect(supabaseMock.from).toHaveBeenCalledWith('pendaftaran');
    });

    it('should throw error if user fetch fails', async () => {
      supabaseMock.from.mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(() => ({
              data: null,
              error: { message: 'User not found' },
            })),
          };
        }
        // Fallback for other tables
        return { select: jest.fn().mockReturnThis() };
      });

      await expect(service.getDashboardData(mockUserId)).rejects.toThrow(
        'User fetch error: User not found',
      );
    });

    it('should throw error if extracurriculars fetch fails', async () => {
      supabaseMock.from.mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(() => ({
              data: {
                id: mockUserId,
                name: 'John Doe',
                role: 'siswa',
                nomorInduk: '12345',
              },
              error: null,
            })),
          };
        } else if (tableName === 'ekstra') {
          return {
            select: jest.fn(() => ({
              data: null,
              error: { message: 'Ekskul not found' },
            })),
          };
        }
        return { select: jest.fn().mockReturnThis() };
      });

      await expect(service.getDashboardData(mockUserId)).rejects.toThrow(
        'Ekskul fetch error: Ekskul not found',
      );
    });

    it('should throw error if registrations fetch fails', async () => {
      supabaseMock.from.mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(() => ({
              data: {
                id: mockUserId,
                name: 'John Doe',
                role: 'siswa',
                nomorInduk: '12345',
              },
              error: null,
            })),
          };
        } else if (tableName === 'ekstra') {
          return {
            select: jest.fn(() => ({
              data: [{ id: 101, nama: 'Basket', jadwal: {}, pembina: {} }],
              error: null,
            })),
          };
        } else if (tableName === 'pendaftaran') {
          return {
            select: jest.fn(() => ({
              data: null,
              error: { message: 'Daftar not found' },
            })),
            eq: jest.fn().mockReturnThis(),
          };
        }
        return { select: jest.fn().mockReturnThis() };
      });

      await expect(service.getDashboardData(mockUserId)).rejects.toThrow(
        'Daftar fetch error: Daftar not found',
      );
    });
  });
});