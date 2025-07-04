import { Test, TestingModule } from '@nestjs/testing';
import { FormPendaftaranService } from './formPendaftaran.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

// Mocks
const mockSelect = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn();
const mockFrom = jest.fn().mockReturnValue({
  select: mockSelect,
  eq: mockEq,
  single: mockSingle,
});

const mockSupabaseClient = {
  from: mockFrom,
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('FormPendaftaranService', () => {
  let service: FormPendaftaranService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormPendaftaranService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FormPendaftaranService>(FormPendaftaranService);

    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return data when found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { id: 1, name: 'Pramuka' },
        error: null,
      });

      const result = await service.getById(1);
      expect(result).toEqual({ id: 1, name: 'Pramuka' });
      expect(mockFrom).toHaveBeenCalledWith('ekstra');
    });

    it('should throw NotFoundException when not found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(service.getById(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAll', () => {
    it('should return all data', async () => {
      // Perlu override select untuk getAll
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce({
          data: [{ id: 1 }],
          error: null,
        }),
      });

      const result = await service.getAll();
      expect(result).toEqual([{ id: 1 }]);
    });

    it('should throw NotFoundException on error', async () => {
      mockFrom.mockReturnValueOnce({
        select: jest.fn().mockResolvedValueOnce({
          data: null,
          error: { message: 'DB error' },
        }),
      });

      await expect(service.getAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFormPendaftaranByEkskulId', () => {
    it('should return ekstrakurikuler and profile', async () => {
      // ekskul
      mockSingle
        .mockResolvedValueOnce({
          data: { id: 1, name: 'Pramuka' },
          error: null,
        })
        // profile
        .mockResolvedValueOnce({
          data: { id: 2, name: 'Siswa' },
          error: null,
        });

      const result = await service.getFormPendaftaranByEkskulId(1, 2);
      expect(result).toEqual({
        ekstrakurikuler: { id: 1, name: 'Pramuka' },
        profile: { id: 2, name: 'Siswa' },
      });

      expect(mockFrom).toHaveBeenCalledWith('ekstra');
      expect(mockFrom).toHaveBeenCalledWith('users');
    });

    it('should throw NotFoundException when ekskul not found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Ekskul not found' },
      });

      await expect(
        service.getFormPendaftaranByEkskulId(99, 2),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when profile not found', async () => {
      // ekskul success
      mockSingle
        .mockResolvedValueOnce({
          data: { id: 1 },
          error: null,
        })
        // profile error
        .mockResolvedValueOnce({
          data: null,
          error: { message: 'User not found' },
        });

      await expect(
        service.getFormPendaftaranByEkskulId(1, 99),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
