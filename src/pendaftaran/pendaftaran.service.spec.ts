import { Test, TestingModule } from '@nestjs/testing';
import { PendaftaranService } from './pendaftaran.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreatePendaftaranDto } from './dto/create-pendaftaran.dto';

// Mock SupabaseClient secara global
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(), // from akan di-mock secara dinamis di beforeEach atau dalam setiap tes
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

  // Helper untuk membuat rantai mock Supabase Query Builder yang lengkap
  const createSupabaseQueryMock = () => {
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn();
    const mockThen = jest.fn(); // Used for count queries (.then(callback => ...))

    const queryMethods = {
      eq: mockEq,
      single: mockSingle,
      then: mockThen,
      select: jest.fn().mockReturnThis(), // select after insert also returns this
    };

    const mockSelect = jest.fn((columns: string, options?: { count?: 'exact' }) => {
      if (options?.count === 'exact') {
        return {
          eq: mockEq,
          then: mockThen,
        };
      }
      return queryMethods;
    });

    const mockInsert = jest.fn().mockReturnThis();

    return {
      select: mockSelect,
      insert: mockInsert,
      mockEq: mockEq,
      mockSingle: mockSingle,
      mockThen: mockThen,
      mockSelectMethod: mockSelect,
      mockInsertMethod: mockInsert,
    };
  };

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
    jest.clearAllMocks();
    jest.useRealTimers(); // Pastikan timer real digunakan secara default
  });

  afterEach(() => {
    jest.useRealTimers(); // Pastikan timer dikembalikan setelah setiap tes
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreatePendaftaranDto = {
      siswa_id: 1,
      eksul_id: 101,
    };

    it('should successfully create a new registration', async () => {
      const mockPendaftaranTable = createSupabaseQueryMock();
      const mockEkstraTable = createSupabaseQueryMock();

      // Mock `supabaseMock.from` untuk mengembalikan mock yang sesuai berdasarkan nama tabel
      supabaseMock.from.mockImplementation((tableName: string) => {
        if (tableName === 'pendaftaran') {
          return mockPendaftaranTable as any;
        }
        if (tableName === 'ekstra') {
          return mockEkstraTable as any;
        }
        throw new Error(`Unexpected table name: ${tableName}`);
      });

      // 1. Panggilan pertama: Cek `existing` (pendaftaran.select().eq().eq().single())
      mockPendaftaranTable.mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      // 2. Panggilan kedua: Cek `count` (pendaftaran.select('id', { count: 'exact' }).eq().then())
      mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: 1, error: null }));

      // 3. Panggilan ketiga: Ambil data `ekstra` (ekstra.select().eq().single())
      mockEkstraTable.mockSingle.mockResolvedValueOnce({
        data: {
          periode_start: '2025-01-01',
          periode_end: '2025-12-31', // Pastikan periode di masa depan
          maxAnggota: 10,
          JumlahAnggota: 5,
        },
        error: null,
      });

      // 4. Panggilan keempat: `insert` (pendaftaran.insert().select().single())
      mockPendaftaranTable.mockInsertMethod.mockReturnThis();
      mockPendaftaranTable.mockSingle.mockResolvedValueOnce({
        data: {
          id: 1,
          siswa_id: createDto.siswa_id,
          eksul_id: createDto.eksul_id,
          status: 'aktif',
          register_at: expect.any(String),
        },
        error: null,
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.siswa_id).toBe(createDto.siswa_id);
      expect(result.eksul_id).toBe(createDto.eksul_id);
      expect(result.status).toBe('aktif');

      // Verifikasi panggilan `from` - sekarang 4 kali
      expect(supabaseMock.from).toHaveBeenCalledTimes(4);
      expect(supabaseMock.from).toHaveBeenCalledWith('pendaftaran');
      expect(supabaseMock.from).toHaveBeenCalledWith('ekstra');

      // Verifikasi panggilan metode Supabase yang relevan
      expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(3);
      expect(mockPendaftaranTable.mockEq).toHaveBeenCalled();
      expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(2);
      expect(mockPendaftaranTable.mockThen).toHaveBeenCalledTimes(1);
      expect(mockPendaftaranTable.mockInsertMethod).toHaveBeenCalledTimes(1);

      expect(mockEkstraTable.select).toHaveBeenCalledTimes(1);
      expect(mockEkstraTable.mockEq).toHaveBeenCalledTimes(1);
      expect(mockEkstraTable.mockSingle).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if student is already registered for the extracurricular', async () => {
      const mockPendaftaranTable = createSupabaseQueryMock();
      supabaseMock.from.mockImplementation((tableName: string) => {
        if (tableName === 'pendaftaran') {
          return mockPendaftaranTable as any;
        }
        throw new Error(`Unexpected table name: ${tableName}`);
      });

      mockPendaftaranTable.mockSingle.mockResolvedValueOnce({
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
      expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(1);
      // Hanya satu panggilan 'from' ke 'pendaftaran' untuk cek existing
      expect(supabaseMock.from).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if student has reached max registrations', async () => {
      const mockPendaftaranTable = createSupabaseQueryMock();
      supabaseMock.from.mockImplementation((tableName: string) => {
        if (tableName === 'pendaftaran') {
          return mockPendaftaranTable as any;
        }
        throw new Error(`Unexpected table name: ${tableName}`);
      });

      // 1. Mock untuk cek existing (tidak ada)
      mockPendaftaranTable.mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      // 2. Mock untuk count (sudah mencapai batas)
      mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: service['MAX_EKSTRA_REGISTRATIONS'], error: null }));

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException(
          `Siswa sudah mendaftar ${service['MAX_EKSTRA_REGISTRATIONS']} ekstrakurikuler dan tidak bisa mendaftar lebih banyak.`,
        ),
      );
      expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(2);
      expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(1);
      expect(mockPendaftaranTable.mockThen).toHaveBeenCalledTimes(1);
      // Dua panggilan 'from' ke 'pendaftaran' untuk existing dan count
      expect(supabaseMock.from).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException if Supabase returns an error during initial fetch', async () => {
      const mockPendaftaranTable = createSupabaseQueryMock();
      supabaseMock.from.mockImplementation((tableName: string) => {
        if (tableName === 'pendaftaran') {
          return mockPendaftaranTable as any;
        }
        throw new Error(`Unexpected table name: ${tableName}`);
      });

      mockPendaftaranTable.mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      });

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('Database connection failed'),
      );
      expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(1);
      expect(supabaseMock.from).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if Supabase returns an error during count fetch', async () => {
      const mockPendaftaranTable = createSupabaseQueryMock();
      supabaseMock.from.mockImplementation((tableName: string) => {
        if (tableName === 'pendaftaran') {
          return mockPendaftaranTable as any;
        }
        throw new Error(`Unexpected table name: ${tableName}`);
      });

      mockPendaftaranTable.mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });

      mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: null, error: { message: 'Count error' } }));

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('Gagal menghitung pendaftaran siswa: Count error'),
      );
      expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(2);
      expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(1);
      expect(mockPendaftaranTable.mockThen).toHaveBeenCalledTimes(1);
      // Dua panggilan 'from' ke 'pendaftaran' untuk existing dan count
      expect(supabaseMock.from).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException if Supabase returns an error during ekskul data fetch', async () => {
      const mockPendaftaranTable = createSupabaseQueryMock();
      const mockEkstraTable = createSupabaseQueryMock();

      supabaseMock.from.mockImplementation((tableName: string) => {
        if (tableName === 'pendaftaran') return mockPendaftaranTable as any;
        if (tableName === 'ekstra') return mockEkstraTable as any;
        throw new Error(`Unexpected table name: ${tableName}`);
      });

      mockPendaftaranTable.mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });

      mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: 1, error: null }));

      mockEkstraTable.mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Ekskul data fetch error' },
      });

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('Gagal mengambil data ekstrakurikuler: Ekskul data fetch error'),
      );
      // Tiga panggilan: pendaftaran (existing), pendaftaran (count), ekstra
      expect(supabaseMock.from).toHaveBeenCalledTimes(3);
      expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(2);
      expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(1);
      expect(mockPendaftaranTable.mockThen).toHaveBeenCalledTimes(1);
      expect(mockEkstraTable.select).toHaveBeenCalledTimes(1);
      expect(mockEkstraTable.mockSingle).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if ekskul data is incomplete', async () => {
        const mockPendaftaranTable = createSupabaseQueryMock();
        const mockEkstraTable = createSupabaseQueryMock();
  
        supabaseMock.from.mockImplementation((tableName: string) => {
          if (tableName === 'pendaftaran') return mockPendaftaranTable as any;
          if (tableName === 'ekstra') return mockEkstraTable as any;
          throw new Error(`Unexpected table name: ${tableName}`);
        });
  
        mockPendaftaranTable.mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
  
        mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: 1, error: null }));
  
        mockEkstraTable.mockSingle.mockResolvedValueOnce({
          data: {
            periode_start: '2025-01-01',
            periode_end: '2025-12-31', // Pastikan periode di masa depan
            maxAnggota: 10,
            // JumlahAnggota missing
          },
          error: null,
        });
  
        await expect(service.create(createDto)).rejects.toThrow(
          new BadRequestException('Data ekstrakurikuler tidak lengkap.'),
        );
        expect(supabaseMock.from).toHaveBeenCalledTimes(3); // pendaftaran (existing), pendaftaran (count), ekstra
        expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(2);
        expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(1);
        expect(mockPendaftaranTable.mockThen).toHaveBeenCalledTimes(1);
        expect(mockEkstraTable.select).toHaveBeenCalledTimes(1);
        expect(mockEkstraTable.mockSingle).toHaveBeenCalledTimes(1);
      });

      it('should throw BadRequestException if registration period has ended', async () => {
        // Set tanggal hari ini ke setelah periode berakhir untuk tujuan tes
        jest.useFakeTimers().setSystemTime(new Date('2026-01-01'));
  
        const mockPendaftaranTable = createSupabaseQueryMock();
        const mockEkstraTable = createSupabaseQueryMock();
  
        supabaseMock.from.mockImplementation((tableName: string) => {
          if (tableName === 'pendaftaran') return mockPendaftaranTable as any;
          if (tableName === 'ekstra') return mockEkstraTable as any;
          throw new Error(`Unexpected table name: ${tableName}`);
        });
  
        mockPendaftaranTable.mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
  
        mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: 1, error: null }));
  
        mockEkstraTable.mockSingle.mockResolvedValueOnce({
          data: {
            periode_start: '2025-01-01',
            periode_end: '2025-12-31', // Ini yang akan membuat validasi periode gagal
            maxAnggota: 10,
            JumlahAnggota: 5,
          },
          error: null,
        });
  
        await expect(service.create(createDto)).rejects.toThrow(
          new BadRequestException('Pendaftaran sudah ditutup karena periode sudah berakhir.'),
        );
        expect(supabaseMock.from).toHaveBeenCalledTimes(3);
        expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(2);
        expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(1);
        expect(mockPendaftaranTable.mockThen).toHaveBeenCalledTimes(1);
        expect(mockEkstraTable.select).toHaveBeenCalledTimes(1);
        expect(mockEkstraTable.mockSingle).toHaveBeenCalledTimes(1);

        // Timer dikembalikan di afterEach
      });

      it('should throw BadRequestException if extracurricular quota is full', async () => {
        // Pastikan periode berada di masa depan agar validasi kuota bisa diuji
        jest.useFakeTimers().setSystemTime(new Date('2025-07-01')); // Tanggal di tengah periode
  
        const mockPendaftaranTable = createSupabaseQueryMock();
        const mockEkstraTable = createSupabaseQueryMock();
  
        supabaseMock.from.mockImplementation((tableName: string) => {
          if (tableName === 'pendaftaran') return mockPendaftaranTable as any;
          if (tableName === 'ekstra') return mockEkstraTable as any;
          throw new Error(`Unexpected table name: ${tableName}`);
        });
  
        mockPendaftaranTable.mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
  
        mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: 1, error: null }));
  
        mockEkstraTable.mockSingle.mockResolvedValueOnce({
          data: {
            periode_start: '2025-01-01',
            periode_end: '2025-12-31', // Periode di masa depan
            maxAnggota: 10,
            JumlahAnggota: 10, // Kuota penuh
          },
          error: null,
        });
  
        await expect(service.create(createDto)).rejects.toThrow(
          new BadRequestException('Kuota ekstrakurikuler sudah penuh.'),
        );
        expect(supabaseMock.from).toHaveBeenCalledTimes(3);
        expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(2);
        expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(1);
        expect(mockPendaftaranTable.mockThen).toHaveBeenCalledTimes(1);
        expect(mockEkstraTable.select).toHaveBeenCalledTimes(1);
        expect(mockEkstraTable.mockSingle).toHaveBeenCalledTimes(1);
        
        // Timer dikembalikan di afterEach
      });

    it('should throw BadRequestException if Supabase returns an error during insert', async () => {
      // Pastikan periode berada di masa depan agar validasi insert bisa diuji
      jest.useFakeTimers().setSystemTime(new Date('2025-07-01'));
      
      const mockPendaftaranTable = createSupabaseQueryMock();
      const mockEkstraTable = createSupabaseQueryMock();

      supabaseMock.from.mockImplementation((tableName: string) => {
        if (tableName === 'pendaftaran') return mockPendaftaranTable as any;
        if (tableName === 'ekstra') return mockEkstraTable as any;
        throw new Error(`Unexpected table name: ${tableName}`);
      });

      mockPendaftaranTable.mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });

      mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: 1, error: null }));

      mockEkstraTable.mockSingle.mockResolvedValueOnce({
        data: {
          periode_start: '2025-01-01',
          periode_end: '2025-12-31', // Periode di masa depan
          maxAnggota: 10,
          JumlahAnggota: 5,
        },
        error: null,
      });

      mockPendaftaranTable.mockInsertMethod.mockReturnThis();
      mockPendaftaranTable.mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Insert failed' },
      });

      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('Insert failed'),
      );
      expect(mockPendaftaranTable.mockInsertMethod).toHaveBeenCalledTimes(1);
      expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(2); // existing dan insert
      expect(supabaseMock.from).toHaveBeenCalledTimes(4); // pendaftaran (existing), pendaftaran (count), ekstra, pendaftaran (insert)
      expect(mockEkstraTable.select).toHaveBeenCalledTimes(1);
      expect(mockEkstraTable.mockSingle).toHaveBeenCalledTimes(1);

      // Timer dikembalikan di afterEach
    });
  });
});