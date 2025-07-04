// src/ekstra/ekstra.service.spec.ts

// 1) Mock chain lengkap
const mockInsertSelectSingle = jest.fn();
const mockInsertEkstraSelectSingle = jest.fn();

const mockSupabase = {
  from: jest.fn((tableName: string) => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: tableName === 'jadwal' ? mockInsertSelectSingle : mockInsertEkstraSelectSingle,
      })),
    })),
  })),
};

// 2) jest.mock harus SEBELUM import lain
jest.mock('../supabase/supabase.client', () => ({
  supabase: mockSupabase,
}));

// 3) Import NestJS
import { Test, TestingModule } from '@nestjs/testing';
import { EkstraService } from './ekstra.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('EkstraService', () => {
  let service: EkstraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EkstraService],
    }).compile();

    service = module.get<EkstraService>(EkstraService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const dto = {
      name: 'Pramuka',
      description: 'Deskripsi',
      registrationStart: '2025-01-01',
      registrationEnd: '2025-02-01',
      maxMembers: 20,
      pembinaId: 1,
      schedules: [
        {
          day: 'Senin',
          startTime: '10:00',
          endTime: '12:00',
        },
      ],
    };

    it('should create jadwal and ekstra successfully', async () => {
      mockInsertSelectSingle.mockResolvedValueOnce({
        data: { id: 5 },
        error: null,
      });
      mockInsertEkstraSelectSingle.mockResolvedValueOnce({
        data: { id: 10 },
        error: null,
      });

      const result = await service.create(dto);

      expect(result).toEqual({
        message: 'Ekstrakurikuler dan jadwal berhasil dibuat',
        ekstra: { id: 10 },
        jadwal: { id: 5 },
      });
    });

    it('should throw InternalServerErrorException if insert jadwal fails', async () => {
      mockInsertSelectSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'DB error jadwal' },
      });

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if insert ekstra fails', async () => {
      mockInsertSelectSingle.mockResolvedValueOnce({
        data: { id: 5 },
        error: null,
      });
      mockInsertEkstraSelectSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'DB error ekstra' },
      });

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
