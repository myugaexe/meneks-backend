"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
jest.mock('../supabase/supabase.client', () => ({
    supabase: mockSupabase,
}));
const testing_1 = require("@nestjs/testing");
const edit_ekstra_service_1 = require("./edit-ekstra.service");
const common_1 = require("@nestjs/common");
describe('EditEkstraService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [edit_ekstra_service_1.EditEkstraService],
        }).compile();
        service = module.get(edit_ekstra_service_1.EditEkstraService);
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
            await expect(service.getOne(99)).rejects.toThrow(common_1.NotFoundException);
        });
    });
    describe('update', () => {
        it('should update jadwal and ekstra successfully', async () => {
            mockSingle.mockResolvedValueOnce({
                data: { jadwal_id: 2 },
                error: null,
            });
            mockUpdateEq
                .mockResolvedValueOnce({ error: null })
                .mockResolvedValueOnce({ error: null });
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
            await expect(service.update(99, {
                name: '',
                description: '',
                maxMembers: 0,
                registrationStart: '',
                registrationEnd: '',
                schedules: [{ day: '', startTime: '', endTime: '' }],
            })).rejects.toThrow(common_1.NotFoundException);
        });
        it('should throw InternalServerErrorException if jadwal update fails', async () => {
            mockSingle.mockResolvedValueOnce({
                data: { jadwal_id: 2 },
                error: null,
            });
            mockUpdateEq.mockResolvedValueOnce({ error: { message: 'DB error' } });
            await expect(service.update(1, {
                name: '',
                description: '',
                maxMembers: 0,
                registrationStart: '',
                registrationEnd: '',
                schedules: [{ day: '', startTime: '', endTime: '' }],
            })).rejects.toThrow(common_1.InternalServerErrorException);
        });
        it('should throw InternalServerErrorException if ekstra update fails', async () => {
            mockSingle.mockResolvedValueOnce({
                data: { jadwal_id: 2 },
                error: null,
            });
            mockUpdateEq
                .mockResolvedValueOnce({ error: null })
                .mockResolvedValueOnce({ error: { message: 'DB error' } });
            await expect(service.update(1, {
                name: '',
                description: '',
                maxMembers: 0,
                registrationStart: '',
                registrationEnd: '',
                schedules: [{ day: '', startTime: '', endTime: '' }],
            })).rejects.toThrow(common_1.InternalServerErrorException);
        });
    });
});
//# sourceMappingURL=edit-ekstra.service.spec.js.map