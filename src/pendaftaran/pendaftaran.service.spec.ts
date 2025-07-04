import { Test, TestingModule } from '@nestjs/testing';
import { PendaftaranService } from './pendaftaran.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreatePendaftaranDto } from './dto/create-pendaftaran.dto';

// Mock SupabaseClient secara global
// Kita akan membuat mock yang lebih fleksibel di beforeEach
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(), // from akan di-mock lebih detail di beforeEach
  })),
}));

// Mock ConfigService
const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'SUPABASE_URL') return 'http://mock.supabase.url';
    if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'mock-key';
    return null;
  }),
};

describe('PendaftaranService', () => {
  let service: PendaftaranService;
  let supabaseMock: jest.Mocked<SupabaseClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PendaftaranService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PendaftaranService>(PendaftaranService);
    supabaseMock = (createClient as jest.Mock).mock.results[0].value;
    jest.clearAllMocks(); // Bersihkan mock setelah mendapatkan instance, agar setiap tes dimulai fresh
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreatePendaftaranDto = {
      siswa_id: 1,
      eksul_id: 101,
    };

    // Helper untuk membuat rantai mock Supabase Query Builder
    // Ini membantu mengulang struktur mock yang sama
    const createSupabaseQueryMock = () => {
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn();
      const mockThen = jest.fn(); // Untuk count queries

      const mockSelect = jest.fn((columns: string, options?: { count?: 'exact' }) => {
        if (options?.count === 'exact') {
          return {
            eq: mockEq,
            then: mockThen, // Untuk count, kita mock then
          };
        }
        return {
          eq: mockEq,
          single: mockSingle,
        };
      });

      const mockInsert = jest.fn().mockReturnThis();

      return {
        select: mockSelect,
        eq: mockEq, // Ini mungkin tidak langsung dipanggil, tapi dibutuhkan untuk chaining
        single: mockSingle,
        insert: mockInsert,
        then: mockThen, // Untuk memudahkan pemanggilan then pada count mock
      };
    };

    it('should successfully create a new registration', async () => {
      // Buat mock untuk tabel 'pendaftaran'
      const mockPendaftaranTable = createSupabaseQueryMock();

      // Atur mock untuk 'from' agar mengembalikan mockPendaftaranTable
      supabaseMock.from.mockReturnValue(mockPendaftaranTable as any);

      // 1. Mock untuk cek `existing` (panggilan pertama .select().eq().single())
      mockPendaftaranTable.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      // 2. Mock untuk `count` (panggilan kedua .select('id', { count: 'exact' }).eq().then())
      // Kita harus mem-mock 'select' lagi dengan implementasi yang berbeda untuk panggilan ini
      // Menggunakan `mockImplementationOnce` pada mock 'select' yang dibuat di `createSupabaseQueryMock`
      (mockPendaftaranTable.select as jest.Mock).mockImplementationOnce((columns: string, options?: { count?: 'exact' }) => {
        if (columns === 'id' && options?.count === 'exact') {
          return {
            eq: jest.fn().mockReturnThis(),
            then: jest.fn(callback => callback({ count: 1, error: null })), // Sudah ada 1 pendaftaran (di bawah batas 2)
          };
        }
        // Ini tidak boleh terpanggil jika urutan mock benar
        return { eq: jest.fn().mockReturnThis() };
      });


      // 3. Mock untuk `insert` (panggilan ketiga .insert().select().single())
      mockPendaftaranTable.insert.mockReturnThis(); // Pastikan insert mengembalikan 'this' untuk chaining
      // Setelah insert, ada .select().single()
      (mockPendaftaranTable.select as jest.Mock).mockImplementationOnce(() => ({
        // Ini adalah select setelah insert, yang mengembalikan data yang diinsert
        eq: jest.fn().mockReturnThis(), // eq mungkin tidak langsung dipanggil, tapi jaga rantai
        single: jest.fn().mockResolvedValueOnce({
          data: {
            id: 1,
            siswa_id: createDto.siswa_id,
            eksul_id: createDto.eksul_id,
            status: 'aktif',
            register_at: expect.any(String),
          },
          error: null,
        }),
      }));


      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.siswa_id).toBe(createDto.siswa_id);
      expect(result.eksul_id).toBe(createDto.eksul_id);
      expect(result.status).toBe('aktif');
      expect(supabaseMock.from).toHaveBeenCalledWith('pendaftaran');

      // Verifikasi panggilan
      expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(2); // Satu untuk existing, satu untuk count
      expect(mockPendaftaranTable.insert).toHaveBeenCalledTimes(1);
      expect(mockPendaftaranTable.single).toHaveBeenCalledTimes(1); // Hanya dipanggil sekali untuk existing
      expect(mockPendaftaranTable.then).toHaveBeenCalledTimes(1); // Hanya dipanggil sekali untuk count
    });


    it('should throw BadRequestException if student is already registered for the extracurricular', async () => {
      const mockPendaftaranTable = createSupabaseQueryMock();
      supabaseMock.from.mockReturnValue(mockPendaftaranTable as any);

      // Mock untuk cek existing (ada data)
      mockPendaftaranTable.single.mockResolvedValueOnce({
        data: {
          id: 1,
          siswa_id: createDto.siswa_id,
          eksul_id: createDto.eksul_id,
          status: 'aktif',
        },
        error: null,
      });

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('Siswa sudah terdaftar di ekstrakurikuler ini.'),
      );
      expect(mockPendaftaranTable.single).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if student has reached max registrations', async () => {
      const mockPendaftaranTable = createSupabaseQueryMock();
      supabaseMock.from.mockReturnValue(mockPendaftaranTable as any);

      // 1. Mock untuk cek existing (tidak ada)
      mockPendaftaranTable.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      // 2. Mock untuk count (sudah mencapai batas)
      // `select` di sini adalah untuk count
      (mockPendaftaranTable.select as jest.Mock).mockImplementationOnce((columns: string, options?: { count?: 'exact' }) => {
        if (columns === 'id' && options?.count === 'exact') {
          return {
            eq: jest.fn().mockReturnThis(),
            then: jest.fn(callback => callback({ count: service['MAX_EKSTRA_REGISTRATIONS'], error: null })), // Sudah mencapai batas
          };
        }
        return { eq: jest.fn().mockReturnThis() };
      });

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException(
          `Siswa sudah mendaftar ${service['MAX_EKSTRA_REGISTRATIONS']} ekstrakurikuler dan tidak bisa mendaftar lebih banyak.`,
        ),
      );
      expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(2); // Satu untuk existing, satu untuk count
      expect(mockPendaftaranTable.single).toHaveBeenCalledTimes(1);
      expect(mockPendaftaranTable.then).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if Supabase returns an error during initial fetch', async () => {
      const mockPendaftaranTable = createSupabaseQueryMock();
      supabaseMock.from.mockReturnValue(mockPendaftaranTable as any);

      // Mock untuk cek existing (error)
      mockPendaftaranTable.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      });

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('Database connection failed'),
      );
      expect(mockPendaftaranTable.single).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if Supabase returns an error during count fetch', async () => {
      const mockPendaftaranTable = createSupabaseQueryMock();
      supabaseMock.from.mockReturnValue(mockPendaftaranTable as any);

      // 1. Mock untuk cek existing (tidak ada)
      mockPendaftaranTable.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });

      // 2. Mock untuk count pendaftaran (error)
      (mockPendaftaranTable.select as jest.Mock).mockImplementationOnce((columns: string, options?: { count?: 'exact' }) => {
        if (columns === 'id' && options?.count === 'exact') {
          return {
            eq: jest.fn().mockReturnThis(),
            then: jest.fn(callback => callback({ count: null, error: { message: 'Count error' } })),
          };
        }
        return { eq: jest.fn().mockReturnThis() };
      });

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('Gagal menghitung pendaftaran siswa: Count error'),
      );
      expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(2);
      expect(mockPendaftaranTable.single).toHaveBeenCalledTimes(1);
      expect(mockPendaftaranTable.then).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if Supabase returns an error during insert', async () => {
      const mockPendaftaranTable = createSupabaseQueryMock();
      supabaseMock.from.mockReturnValue(mockPendaftaranTable as any);

      // 1. Mock untuk cek existing (tidak ada)
      mockPendaftaranTable.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });

      // 2. Mock untuk count pendaftaran (sukses, kurang dari batas)
      (mockPendaftaranTable.select as jest.Mock).mockImplementationOnce((columns: string, options?: { count?: 'exact' }) => {
        if (columns === 'id' && options?.count === 'exact') {
          return {
            eq: jest.fn().mockReturnThis(),
            then: jest.fn(callback => callback({ count: 1, error: null })),
          };
        }
        return { eq: jest.fn().mockReturnThis() };
      });

      // 3. Mock untuk insert (error)
      mockPendaftaranTable.insert.mockReturnThis();
      // select setelah insert
      (mockPendaftaranTable.select as jest.Mock).mockImplementationOnce(() => ({
        single: jest.fn().mockResolvedValueOnce({
          data: null,
          error: { message: 'Insert failed' },
        }),
      }));

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('Insert failed'),
      );
      expect(mockPendaftaranTable.insert).toHaveBeenCalledTimes(1);
      expect(mockPendaftaranTable.single).toHaveBeenCalledTimes(2); // Sekali untuk existing, sekali untuk insert
      expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(3); // Sekali untuk existing, sekali untuk count, sekali untuk setelah insert
    });
  });
});