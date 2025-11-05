"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mockInsertSelectSingle = jest.fn();
const mockInsertEkstraSelectSingle = jest.fn();
const mockSupabase = {
    from: jest.fn((tableName) => ({
        insert: jest.fn(() => ({
            select: jest.fn(() => ({
                single: tableName === 'jadwal' ? mockInsertSelectSingle : mockInsertEkstraSelectSingle,
            })),
        })),
    })),
};
jest.mock('../supabase/supabase.client', () => ({
    supabase: mockSupabase,
}));
const testing_1 = require("@nestjs/testing");
const ekstra_service_1 = require("./ekstra.service");
const common_1 = require("@nestjs/common");
describe('EkstraService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [ekstra_service_1.EkstraService],
        }).compile();
        service = module.get(ekstra_service_1.EkstraService);
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
            await expect(service.create(dto)).rejects.toThrow(common_1.InternalServerErrorException);
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
            await expect(service.create(dto)).rejects.toThrow(common_1.InternalServerErrorException);
        });
    });
});
//# sourceMappingURL=ekstra.service.spec.js.map