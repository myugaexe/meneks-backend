import { Test, TestingModule } from '@nestjs/testing';
import { EditEkstraController } from './edit-ekstra.controller';
import { EditEkstraService } from './edit-ekstra.service';
import { UpdateEkstraDto } from './dto/update-ekstra.dto';

describe('EditEkstraController', () => {
  let controller: EditEkstraController;
  let service: EditEkstraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditEkstraController],
      providers: [
        {
          provide: EditEkstraService,
          useValue: {
            update: jest.fn(),
            getOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EditEkstraController>(EditEkstraController);
    service = module.get<EditEkstraService>(EditEkstraService);
  });

  describe('updateEkstra', () => {
    it('should call service.update with correct parameters and return result', async () => {
      const id = 1;
      const dto: UpdateEkstraDto = {
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

      (service.update as jest.Mock).mockResolvedValue(expectedResult);

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

      (service.getOne as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.getEkstra(id);

      expect(service.getOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });
});
