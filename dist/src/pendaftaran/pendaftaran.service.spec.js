"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const pendaftaran_service_1 = require("./pendaftaran.service");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        from: jest.fn(),
    })),
}));
const mockConfigService = {
    get: jest.fn((key) => {
        if (key === 'SUPABASE_URL')
            return 'http://mock.supabase.url';
        if (key === 'SUPABASE_SERVICE_ROLE_KEY')
            return 'mock-key';
        return null;
    }),
};
describe('PendaftaranService', () => {
    let service;
    let supabaseMock;
    const createSupabaseQueryMock = () => {
        const mockEq = jest.fn().mockReturnThis();
        const mockSingle = jest.fn();
        const mockThen = jest.fn();
        const queryMethods = {
            eq: mockEq,
            single: mockSingle,
            then: mockThen,
            select: jest.fn().mockReturnThis(),
        };
        const mockSelect = jest.fn((columns, options) => {
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                pendaftaran_service_1.PendaftaranService,
                {
                    provide: config_1.ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();
        service = module.get(pendaftaran_service_1.PendaftaranService);
        supabaseMock = supabase_js_1.createClient.mock.results[0].value;
        jest.clearAllMocks();
        jest.useRealTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('create', () => {
        const createDto = {
            siswa_id: 1,
            eksul_id: 101,
        };
        it('should successfully create a new registration', async () => {
            const mockPendaftaranTable = createSupabaseQueryMock();
            const mockEkstraTable = createSupabaseQueryMock();
            supabaseMock.from.mockImplementation((tableName) => {
                if (tableName === 'pendaftaran') {
                    return mockPendaftaranTable;
                }
                if (tableName === 'ekstra') {
                    return mockEkstraTable;
                }
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            mockPendaftaranTable.mockSingle.mockResolvedValueOnce({
                data: null,
                error: { code: 'PGRST116', message: 'No rows found' },
            });
            mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: 1, error: null }));
            mockEkstraTable.mockSingle.mockResolvedValueOnce({
                data: {
                    periode_start: '2025-01-01',
                    periode_end: '2025-12-31',
                    maxAnggota: 10,
                    JumlahAnggota: 5,
                },
                error: null,
            });
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
            expect(supabaseMock.from).toHaveBeenCalledTimes(4);
            expect(supabaseMock.from).toHaveBeenCalledWith('pendaftaran');
            expect(supabaseMock.from).toHaveBeenCalledWith('ekstra');
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
            supabaseMock.from.mockImplementation((tableName) => {
                if (tableName === 'pendaftaran') {
                    return mockPendaftaranTable;
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
            await expect(service.create(createDto)).rejects.toThrow(new common_1.BadRequestException('Siswa sudah terdaftar di ekstrakurikuler ini.'));
            expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(1);
            expect(supabaseMock.from).toHaveBeenCalledTimes(1);
        });
        it('should throw BadRequestException if student has reached max registrations', async () => {
            const mockPendaftaranTable = createSupabaseQueryMock();
            supabaseMock.from.mockImplementation((tableName) => {
                if (tableName === 'pendaftaran') {
                    return mockPendaftaranTable;
                }
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            mockPendaftaranTable.mockSingle.mockResolvedValueOnce({
                data: null,
                error: { code: 'PGRST116', message: 'No rows found' },
            });
            mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: service['MAX_EKSTRA_REGISTRATIONS'], error: null }));
            await expect(service.create(createDto)).rejects.toThrow(new common_1.BadRequestException(`Siswa sudah mendaftar ${service['MAX_EKSTRA_REGISTRATIONS']} ekstrakurikuler dan tidak bisa mendaftar lebih banyak.`));
            expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(2);
            expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(1);
            expect(mockPendaftaranTable.mockThen).toHaveBeenCalledTimes(1);
            expect(supabaseMock.from).toHaveBeenCalledTimes(2);
        });
        it('should throw BadRequestException if Supabase returns an error during initial fetch', async () => {
            const mockPendaftaranTable = createSupabaseQueryMock();
            supabaseMock.from.mockImplementation((tableName) => {
                if (tableName === 'pendaftaran') {
                    return mockPendaftaranTable;
                }
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            mockPendaftaranTable.mockSingle.mockResolvedValueOnce({
                data: null,
                error: { message: 'Database connection failed' },
            });
            await expect(service.create(createDto)).rejects.toThrow(new common_1.BadRequestException('Database connection failed'));
            expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(1);
            expect(supabaseMock.from).toHaveBeenCalledTimes(1);
        });
        it('should throw BadRequestException if Supabase returns an error during count fetch', async () => {
            const mockPendaftaranTable = createSupabaseQueryMock();
            supabaseMock.from.mockImplementation((tableName) => {
                if (tableName === 'pendaftaran') {
                    return mockPendaftaranTable;
                }
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            mockPendaftaranTable.mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
            mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: null, error: { message: 'Count error' } }));
            await expect(service.create(createDto)).rejects.toThrow(new common_1.BadRequestException('Gagal menghitung pendaftaran siswa: Count error'));
            expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(2);
            expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(1);
            expect(mockPendaftaranTable.mockThen).toHaveBeenCalledTimes(1);
            expect(supabaseMock.from).toHaveBeenCalledTimes(2);
        });
        it('should throw BadRequestException if Supabase returns an error during ekskul data fetch', async () => {
            const mockPendaftaranTable = createSupabaseQueryMock();
            const mockEkstraTable = createSupabaseQueryMock();
            supabaseMock.from.mockImplementation((tableName) => {
                if (tableName === 'pendaftaran')
                    return mockPendaftaranTable;
                if (tableName === 'ekstra')
                    return mockEkstraTable;
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            mockPendaftaranTable.mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
            mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: 1, error: null }));
            mockEkstraTable.mockSingle.mockResolvedValueOnce({
                data: null,
                error: { message: 'Ekskul data fetch error' },
            });
            await expect(service.create(createDto)).rejects.toThrow(new common_1.BadRequestException('Gagal mengambil data ekstrakurikuler: Ekskul data fetch error'));
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
            supabaseMock.from.mockImplementation((tableName) => {
                if (tableName === 'pendaftaran')
                    return mockPendaftaranTable;
                if (tableName === 'ekstra')
                    return mockEkstraTable;
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            mockPendaftaranTable.mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
            mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: 1, error: null }));
            mockEkstraTable.mockSingle.mockResolvedValueOnce({
                data: {
                    periode_start: '2025-01-01',
                    periode_end: '2025-12-31',
                    maxAnggota: 10,
                },
                error: null,
            });
            await expect(service.create(createDto)).rejects.toThrow(new common_1.BadRequestException('Data ekstrakurikuler tidak lengkap.'));
            expect(supabaseMock.from).toHaveBeenCalledTimes(3);
            expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(2);
            expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(1);
            expect(mockPendaftaranTable.mockThen).toHaveBeenCalledTimes(1);
            expect(mockEkstraTable.select).toHaveBeenCalledTimes(1);
            expect(mockEkstraTable.mockSingle).toHaveBeenCalledTimes(1);
        });
        it('should throw BadRequestException if registration period has ended', async () => {
            jest.useFakeTimers().setSystemTime(new Date('2026-01-01'));
            const mockPendaftaranTable = createSupabaseQueryMock();
            const mockEkstraTable = createSupabaseQueryMock();
            supabaseMock.from.mockImplementation((tableName) => {
                if (tableName === 'pendaftaran')
                    return mockPendaftaranTable;
                if (tableName === 'ekstra')
                    return mockEkstraTable;
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            mockPendaftaranTable.mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
            mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: 1, error: null }));
            mockEkstraTable.mockSingle.mockResolvedValueOnce({
                data: {
                    periode_start: '2025-01-01',
                    periode_end: '2025-12-31',
                    maxAnggota: 10,
                    JumlahAnggota: 5,
                },
                error: null,
            });
            await expect(service.create(createDto)).rejects.toThrow(new common_1.BadRequestException('Pendaftaran sudah ditutup karena periode sudah berakhir.'));
            expect(supabaseMock.from).toHaveBeenCalledTimes(3);
            expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(2);
            expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(1);
            expect(mockPendaftaranTable.mockThen).toHaveBeenCalledTimes(1);
            expect(mockEkstraTable.select).toHaveBeenCalledTimes(1);
            expect(mockEkstraTable.mockSingle).toHaveBeenCalledTimes(1);
        });
        it('should throw BadRequestException if extracurricular quota is full', async () => {
            jest.useFakeTimers().setSystemTime(new Date('2025-07-01'));
            const mockPendaftaranTable = createSupabaseQueryMock();
            const mockEkstraTable = createSupabaseQueryMock();
            supabaseMock.from.mockImplementation((tableName) => {
                if (tableName === 'pendaftaran')
                    return mockPendaftaranTable;
                if (tableName === 'ekstra')
                    return mockEkstraTable;
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            mockPendaftaranTable.mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
            mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: 1, error: null }));
            mockEkstraTable.mockSingle.mockResolvedValueOnce({
                data: {
                    periode_start: '2025-01-01',
                    periode_end: '2025-12-31',
                    maxAnggota: 10,
                    JumlahAnggota: 10,
                },
                error: null,
            });
            await expect(service.create(createDto)).rejects.toThrow(new common_1.BadRequestException('Kuota ekstrakurikuler sudah penuh.'));
            expect(supabaseMock.from).toHaveBeenCalledTimes(3);
            expect(mockPendaftaranTable.select).toHaveBeenCalledTimes(2);
            expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(1);
            expect(mockPendaftaranTable.mockThen).toHaveBeenCalledTimes(1);
            expect(mockEkstraTable.select).toHaveBeenCalledTimes(1);
            expect(mockEkstraTable.mockSingle).toHaveBeenCalledTimes(1);
        });
        it('should throw BadRequestException if Supabase returns an error during insert', async () => {
            jest.useFakeTimers().setSystemTime(new Date('2025-07-01'));
            const mockPendaftaranTable = createSupabaseQueryMock();
            const mockEkstraTable = createSupabaseQueryMock();
            supabaseMock.from.mockImplementation((tableName) => {
                if (tableName === 'pendaftaran')
                    return mockPendaftaranTable;
                if (tableName === 'ekstra')
                    return mockEkstraTable;
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            mockPendaftaranTable.mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
            mockPendaftaranTable.mockThen.mockImplementationOnce(callback => callback({ count: 1, error: null }));
            mockEkstraTable.mockSingle.mockResolvedValueOnce({
                data: {
                    periode_start: '2025-01-01',
                    periode_end: '2025-12-31',
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
            await expect(service.create(createDto)).rejects.toThrow(new common_1.BadRequestException('Insert failed'));
            expect(mockPendaftaranTable.mockInsertMethod).toHaveBeenCalledTimes(1);
            expect(mockPendaftaranTable.mockSingle).toHaveBeenCalledTimes(2);
            expect(supabaseMock.from).toHaveBeenCalledTimes(4);
            expect(mockEkstraTable.select).toHaveBeenCalledTimes(1);
            expect(mockEkstraTable.mockSingle).toHaveBeenCalledTimes(1);
        });
    });
});
//# sourceMappingURL=pendaftaran.service.spec.js.map