"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const pembina_service_1 = require("./pembina.service");
const supabase_js_1 = require("@supabase/supabase-js");
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        from: jest.fn(),
    })),
}));
const mockProcessEnv = {
    SUPABASE_URL: 'http://mock.supabase.url',
    SUPABASE_SERVICE_ROLE_KEY: 'mock-key',
};
const OLD_ENV = process.env;
beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, ...mockProcessEnv };
});
afterAll(() => {
    process.env = OLD_ENV;
});
describe('PembinaService', () => {
    let service;
    let supabaseMock;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [pembina_service_1.PembinaService],
        }).compile();
        service = module.get(pembina_service_1.PembinaService);
        supabaseMock = supabase_js_1.createClient.mock.results[0].value;
        jest.clearAllMocks();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('getDashboardData', () => {
        const mockUserId = 'pembina123';
        it('should return dashboard data for a supervisor successfully', async () => {
            supabaseMock.from.mockImplementation((tableName) => {
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
                }
                else if (tableName === 'ekstra') {
                    return {
                        select: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockResolvedValueOnce({
                            data: [
                                { id: 101, nama: 'Pramuka', pembina_id: mockUserId, jadwal: { hari: 'Senin' } },
                                { id: 102, nama: 'Robotik', pembina_id: mockUserId, jadwal: { hari: 'Rabu' } },
                            ],
                            error: null,
                        }),
                    };
                }
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            const result = await service.getDashboardData(mockUserId);
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
            expect(supabaseMock.from).toHaveBeenCalledTimes(2);
            expect(supabaseMock.from).toHaveBeenCalledWith('users');
            expect(supabaseMock.from).toHaveBeenCalledWith('ekstra');
        });
        it('should throw error if user data fetch fails', async () => {
            supabaseMock.from.mockImplementation((tableName) => {
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
                return {
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                };
            });
            await expect(service.getDashboardData(mockUserId)).rejects.toThrow('User not found');
            expect(supabaseMock.from).toHaveBeenCalledWith('users');
        });
        it('should throw error if extracurriculars data fetch fails', async () => {
            supabaseMock.from.mockImplementation((tableName) => {
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
                }
                else if (tableName === 'ekstra') {
                    return {
                        select: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockResolvedValueOnce({
                            data: null,
                            error: { message: 'Extracurriculars not found' },
                        }),
                    };
                }
                throw new Error(`Unexpected table name: ${tableName}`);
            });
            await expect(service.getDashboardData(mockUserId)).rejects.toThrow('Extracurriculars not found');
            expect(supabaseMock.from).toHaveBeenCalledWith('users');
            expect(supabaseMock.from).toHaveBeenCalledWith('ekstra');
        });
    });
});
//# sourceMappingURL=pembina.service.spec.js.map