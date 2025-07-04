import { Test, TestingModule } from '@nestjs/testing';
import { SiswaService } from './siswa.service';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Mock SupabaseClient secara global
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(), // 'from' akan di-mock secara dinamis di beforeEach atau dalam setiap tes
  })),
}));

// Mock process.env
const mockProcessEnv = {
  SUPABASE_URL: 'http://mock.supabase.url',
  SUPABASE_SERVICE_ROLE_KEY: 'mock-key',
};

// Mock the global process object to ensure environment variables are available during service instantiation
const OLD_ENV = process.env;
beforeEach(() => {
  jest.resetModules(); // Ini penting untuk membersihkan cache `process.env`
  process.env = { ...OLD_ENV, ...mockProcessEnv };
});

afterAll(() => {
  process.env = OLD_ENV; // Kembalikan env lama
});

// Helper untuk membuat rantai mock Supabase Query Builder yang lengkap
const createSupabaseQueryMock = () => {
  const mockEq = jest.fn().mockReturnThis();
  const mockSingle = jest.fn();
  const mockSelect = jest.fn().mockReturnThis();
  const mockInsert = jest.fn().mockReturnThis();

  let mockData: any = null;
  let mockError: any = new Error('Mock not configured properly');

  const updateChainableMethods = () => {
    // Memastikan setiap pemanggilan single() akan me-resolve nilai yang diatur terakhir kali
    mockSingle.mockImplementation(() => Promise.resolve({ data: mockData, error: mockError }));
    // Memastikan .then() (untuk query non-single) juga me-resolve nilai yang diatur terakhir kali
    chainableMethods.then.mockImplementation((onFulfilled, onRejected) => Promise.resolve({ data: mockData, error: mockError }).then(onFulfilled, onRejected));
  };

  const chainableMethods = {
    select: mockSelect,
    eq: mockEq,
    insert: mockInsert,
    single: mockSingle, // single sudah di-mock di `updateChainableMethods`
    then: jest.fn(), // `then` akan di-mock di `updateChainableMethods`
  };

  mockSelect.mockImplementation(() => {
    updateChainableMethods(); // Perbarui resolve/reject setiap kali select dipanggil
    return chainableMethods;
  });
  mockEq.mockImplementation(() => {
    updateChainableMethods(); // Perbarui resolve/reject setiap kali eq dipanggil
    return chainableMethods;
  });

  return {
    ...chainableMethods,
    mockEq: mockEq,
    mockSingle: mockSingle,
    mockSelectMethod: mockSelect,
    mockInsertMethod: mockInsert,

    setResolveValue: (data: any) => { 
        mockData = data;
        mockError = null;
        updateChainableMethods();
    }, 
    setRejectValue: (error: { message: string } | Error) => { 
        const errorObject = error instanceof Error ? { message: error.message } : error;
        mockData = null;
        mockError = errorObject;
        updateChainableMethods();
    },
    // Method khusus untuk mock .single() yang gagal (jika ingin perilaku berbeda dari setRejectValue)
    setSingleReject: (error: { message: string } | Error) => {
        const errorObject = error instanceof Error ? { message: error.message } : error;
        mockSingle.mockResolvedValueOnce({ data: null, error: errorObject }); 
    }
  };
};


describe('SiswaService', () => {
  let service: SiswaService;
  let supabaseMock: jest.Mocked<SupabaseClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SiswaService],
    }).compile();

    service = module.get<SiswaService>(SiswaService);
    supabaseMock = (createClient as jest.Mock).mock.results[0].value;
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardData', () => {
    const mockUserId = 1;

    it('should return dashboard data successfully', async () => {
      const mockUserQuery = createSupabaseQueryMock();
      const mockEkstraQuery = createSupabaseQueryMock();
      const mockPendaftaranQuery = createSupabaseQueryMock();

      (supabaseMock.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          mockUserQuery.setResolveValue({ id: mockUserId, name: 'Siswa A', role: 'siswa', nomorInduk: 'S001' });
          return mockUserQuery;
        } else if (tableName === 'ekstra') {
          mockEkstraQuery.setResolveValue([
            { id: 101, nama: 'Pramuka', jadwal: { hari: 'Senin', waktuMulai: '14:00', waktuSelesai: '16:00' }, pembina: { id: 'p1', name: 'Pembina A' } },
            { id: 102, nama: 'Robotik', jadwal: { hari: 'Rabu', waktuMulai: '15:00', waktuSelesai: '17:00' }, pembina: { id: 'p2', name: 'Pembina B' } },
          ]);
          return mockEkstraQuery;
        } else if (tableName === 'pendaftaran') {
          mockPendaftaranQuery.setResolveValue([
            { id: 1, status: 'aktif', register_at: '2025-01-15', ekstra: { id: 101, nama: 'Pramuka', jadwal: { hari: 'Senin', waktuMulai: '14:00', waktuSelesai: '16:00' }, pembina: { id: 'p1', name: 'Pembina A' } } },
          ]);
          return mockPendaftaranQuery;
        }
        return createSupabaseQueryMock(); 
      });

      const result = await service.getDashboardData(mockUserId);

      expect(result).toBeDefined();
      expect(result.user).toEqual({ id: mockUserId, name: 'Siswa A', role: 'siswa', nomorInduk: 'S001' });
      expect(result.allExtracurriculars).toBeInstanceOf(Array);
      expect(result.allExtracurriculars).toHaveLength(2);
      expect(result.myExtracurriculars).toBeInstanceOf(Array);
      expect(result.myExtracurriculars).toHaveLength(1);

      expect(supabaseMock.from).toHaveBeenCalledTimes(3);
      expect(supabaseMock.from).toHaveBeenCalledWith('users');
      expect(supabaseMock.from).toHaveBeenCalledWith('ekstra');
      expect(supabaseMock.from).toHaveBeenCalledWith('pendaftaran');

      expect(mockUserQuery.mockSelectMethod).toHaveBeenCalledWith('id, name, role, nomorInduk');
      expect(mockUserQuery.mockEq).toHaveBeenCalledWith('id', mockUserId);
      expect(mockUserQuery.mockSingle).toHaveBeenCalledTimes(1);

      // Ekspektasi sekarang cocok dengan string yang dinormalisasi di siswa.service.ts
      expect(mockEkstraQuery.mockSelectMethod).toHaveBeenCalledWith('*, jadwal (hari, waktuMulai, waktuSelesai), pembina:users (id, name)'); 
      expect(mockEkstraQuery.mockEq).not.toHaveBeenCalled();

      // Ekspektasi sekarang cocok dengan string yang dinormalisasi di siswa.service.ts
      expect(mockPendaftaranQuery.mockSelectMethod).toHaveBeenCalledWith('id, status, register_at, ekstra (*, jadwal (hari, waktuMulai, waktuSelesai), pembina:users (id, name))');
      expect(mockPendaftaranQuery.mockEq).toHaveBeenCalledWith('siswa_id', mockUserId);
      expect(mockPendaftaranQuery.mockSingle).not.toHaveBeenCalled(); 
    });

    it('should throw error if user fetch fails', async () => {
      const mockUserQuery = createSupabaseQueryMock();
      (supabaseMock.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          mockUserQuery.setSingleReject({ message: 'User not found' }); 
          return mockUserQuery;
        }
        return createSupabaseQueryMock();
      });

      await expect(service.getDashboardData(mockUserId)).rejects.toThrow(
        'User fetch error: User not found',
      );
      expect(supabaseMock.from).toHaveBeenCalledWith('users');
      expect(supabaseMock.from).toHaveBeenCalledTimes(1);
    });

    it('should throw error if extracurriculars fetch fails', async () => {
      const mockUserQuery = createSupabaseQueryMock();
      const mockEkstraQuery = createSupabaseQueryMock();

      (supabaseMock.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          mockUserQuery.setResolveValue({ id: mockUserId, name: 'Siswa A', role: 'siswa', nomorInduk: 'S001' });
          return mockUserQuery;
        } else if (tableName === 'ekstra') {
          mockEkstraQuery.setRejectValue(new Error('Ekskul not found')); 
          return mockEkstraQuery;
        }
        return createSupabaseQueryMock(); 
      });

      await expect(service.getDashboardData(mockUserId)).rejects.toThrow(
        'Ekskul fetch error: Ekskul not found',
      );
      expect(supabaseMock.from).toHaveBeenCalledWith('users');
      expect(supabaseMock.from).toHaveBeenCalledWith('ekstra');
      expect(supabaseMock.from).toHaveBeenCalledTimes(2);
    });

    it('should throw error if registrations fetch fails', async () => {
      const mockUserQuery = createSupabaseQueryMock();
      const mockEkstraQuery = createSupabaseQueryMock();
      const mockPendaftaranQuery = createSupabaseQueryMock();

      (supabaseMock.from as jest.Mock).mockImplementation((tableName: string) => {
        if (tableName === 'users') {
          mockUserQuery.setResolveValue({ id: mockUserId, name: 'Siswa A', role: 'siswa', nomorInduk: 'S001' });
          return mockUserQuery;
        } else if (tableName === 'ekstra') {
          mockEkstraQuery.setResolveValue([
            { id: 101, nama: 'Pramuka', jadwal: { hari: 'Senin' }, pembina: { id: 'p1', name: 'Pembina A' } },
          ]);
          return mockEkstraQuery;
        } else if (tableName === 'pendaftaran') {
          mockPendaftaranQuery.setRejectValue(new Error('Daftar not found')); 
          return mockPendaftaranQuery;
        }
        return createSupabaseQueryMock();
      });

      await expect(service.getDashboardData(mockUserId)).rejects.toThrow(
        'Daftar fetch error: Daftar not found',
      );
      expect(supabaseMock.from).toHaveBeenCalledWith('users');
      expect(supabaseMock.from).toHaveBeenCalledWith('ekstra');
      expect(supabaseMock.from).toHaveBeenCalledWith('pendaftaran');
      expect(supabaseMock.from).toHaveBeenCalledTimes(3);
    });
  });
});