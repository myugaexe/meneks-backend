"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const edit_ekstra_controller_1 = require("./edit-ekstra.controller");
const edit_ekstra_service_1 = require("./edit-ekstra.service");
describe('EditEkstraController', () => {
    let controller;
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [edit_ekstra_controller_1.EditEkstraController],
            providers: [
                {
                    provide: edit_ekstra_service_1.EditEkstraService,
                    useValue: {
                        update: jest.fn(),
                        getOne: jest.fn(),
                    },
                },
            ],
        }).compile();
        controller = module.get(edit_ekstra_controller_1.EditEkstraController);
        service = module.get(edit_ekstra_service_1.EditEkstraService);
    });
    describe('updateEkstra', () => {
        it('should call service.update with correct parameters and return result', async () => {
            const id = 1;
            const dto = {
                name: 'Test Ekstra',
                description: 'Deskripsi',
                maxMembers: 20,
                registrationStart: '2025-07-01',
                registrationEnd: '2025-07-31',
                schedules: [
                    {
                        day: 'Senin',
                        startTime: '10:00',
                        endTime: '12:00',
                    },
                ],
            };
            const expectedResult = { message: 'Updated successfully' };
            service.update.mockResolvedValue(expectedResult);
            const result = await controller.updateEkstra(id, dto);
            expect(service.update).toHaveBeenCalledWith(id, dto);
            expect(result).toEqual(expectedResult);
        });
    });
    describe('getEkstra', () => {
        it('should call service.getOne with correct id and return result', async () => {
            const id = 2;
            const expectedResult = {
                id: 2,
                name: 'Test Ekstra 2',
                description: 'Deskripsi 2',
                maxMembers: 30,
                registrationStart: '2025-08-01',
                registrationEnd: '2025-08-31',
                schedule: {
                    id: 1,
                    day: 'Selasa',
                    startTime: '13:00',
                    endTime: '15:00',
                },
            };
            service.getOne.mockResolvedValue(expectedResult);
            const result = await controller.getEkstra(id);
            expect(service.getOne).toHaveBeenCalledWith(id);
            expect(result).toEqual(expectedResult);
        });
    });
});
//# sourceMappingURL=edit-ekstra.controller.spec.js.map