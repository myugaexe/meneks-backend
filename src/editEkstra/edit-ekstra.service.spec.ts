// src/editEkstra/edit-ekstra.service.spec.ts

// 1) Mock chain lengkap
const mockSingle = jest.fn();
const mockUpdateEq = jest.fn();

const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: mockSingle,
      })),
    })),
    update: jest.fn(() => ({
      eq: mockUpdateEq,
    })),
  })),
};

// 2) jest.mock sebelum import lain
jest.mock('../supabase/supabase.client', () => ({
  supabase: mockSupabase,
}));

// 3) Import lain
import { Test, TestingModule } from '@nestjs/testing';
import { EditEkstraService } from './edit-ekstra.service';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('EditEkstraService', () => {
  let service: EditEkstraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EditEkstraService],
    }).compile();

    service = module.get<EditEkstraService>(EditEkstraService);
    jest.clearAllMocks();
  });

  describe('getOne', () => {
    it('should return ekstrakurikuler data when found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: {
          id: 1,
          name: 'Pramuka',
          description: 'Deskripsi',
          maxAnggota: 20,
          periode_start: '2025-01-01',
          periode_end: '2025-02-01',
          jadwal: {
            id: 2,
            hari: 'Senin',
            waktuMulai: '10:00',
            waktuSelesai: '12:00',
          },
        },
        error: null,
      });

      const result = await service.getOne(1);

      expect(result).toEqual({
        id: 1,
        name: 'Pramuka',
        description: 'Deskripsi',
        maxMembers: 20,
        registrationStart: '2025-01-01',
        registrationEnd: '2025-02-01',
        schedule: {
          id: 2,
          day: 'Senin',
          startTime: '10:00',
          endTime: '12:00',
        },
      });
    });

    it('should throw NotFoundException when not found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(service.getOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update jadwal and ekstra successfully', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { jadwal_id: 2 },
        error: null,
      });
      mockUpdateEq
        .mockResolvedValueOnce({ error: null }) // jadwal update success
        .mockResolvedValueOnce({ error: null }); // ekstra update success

      const result = await service.update(1, {
        name: 'New Name',
        description: 'New Desc',
        maxMembers: 10,
        registrationStart: '2025-01-01',
        registrationEnd: '2025-02-01',
        schedules: [
          {
            day: 'Senin',
            startTime: '10:00',
            endTime: '12:00',
          },
        ],
      });

      expect(result).toEqual({ message: 'Ekstrakurikuler berhasil diperbarui' });
    });

    it('should throw NotFoundException if ekstrakurikuler not found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      await expect(
        service.update(99, {
          name: '',
          description: '',
          maxMembers: 0,
          registrationStart: '',
          registrationEnd: '',
          schedules: [{ day: '', startTime: '', endTime: '' }],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if jadwal update fails', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { jadwal_id: 2 },
        error: null,
      });
      mockUpdateEq.mockResolvedValueOnce({ error: { message: 'DB error' } });

      await expect(
        service.update(1, {
          name: '',
          description: '',
          maxMembers: 0,
          registrationStart: '',
          registrationEnd: '',
          schedules: [{ day: '', startTime: '', endTime: '' }],
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException if ekstra update fails', async () => {
      mockSingle.mockResolvedValueOnce({
        data: { jadwal_id: 2 },
        error: null,
      });
      mockUpdateEq
        .mockResolvedValueOnce({ error: null }) // jadwal update success
        .mockResolvedValueOnce({ error: { message: 'DB error' } }); // ekstra update fail

      await expect(
        service.update(1, {
          name: '',
          description: '',
          maxMembers: 0,
          registrationStart: '',
          registrationEnd: '',
          schedules: [{ day: '', startTime: '', endTime: '' }],
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
