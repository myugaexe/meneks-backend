// import { Test, TestingModule } from '@nestjs/testing';
// import { EkstraService } from './ekstra.service';
// import { InternalServerErrorException } from '@nestjs/common';
// import { supabase } from '../supabase/supabase.client';
// import { CreateEkstraDto } from './dto/create-ekstra.dto';

// jest.mock('../supabase/supabase.client');

// describe('EkstraService', () => {
//   let service: EkstraService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [EkstraService],
//     }).compile();

//     service = module.get<EkstraService>(EkstraService);
//     jest.clearAllMocks(); // Reset sebelum setiap test
//   });

//   const dto: CreateEkstraDto = {
//     name: 'Futsal',
//     description: 'Ekstrakurikuler Futsal Sekolah',
//     registrationStart: '2025-07-01',
//     registrationEnd: '2025-07-31',
//     maxMembers: 20,
//     pembinaId: 11,
//     schedules: [
//       {
//         day: 'Senin',
//         startTime: '14:00',
//         endTime: '16:00',
//       },
//     ],
//   };

//   it('should create ekstra and jadwal successfully', async () => {
//     (supabase.from as jest.Mock).mockReturnValueOnce({
//       insert: jest.fn().mockReturnValueOnce({
//         select: jest.fn().mockReturnValueOnce({
//           single: jest.fn().mockResolvedValue({
//             data: { id: 'jadwal-1' },
//             error: null,
//           }),
//         }),
//       }),
//     });

//     (supabase.from as jest.Mock).mockReturnValueOnce({
//       insert: jest.fn().mockReturnValueOnce({
//         select: jest.fn().mockReturnValueOnce({
//           single: jest.fn().mockResolvedValue({
//             data: { id: 'ekstra-1', name: dto.name },
//             error: null,
//           }),
//         }),
//       }),
//     });

//     const result = await service.create(dto);

//     expect(result).toEqual({
//       message: 'Ekstrakurikuler dan jadwal berhasil dibuat',
//       jadwal: { id: 'jadwal-1' },
//       ekstra: { id: 'ekstra-1', name: dto.name },
//     });
//   });

//   it('should throw error if jadwal insert fails', async () => {
//     (supabase.from as jest.Mock).mockReturnValueOnce({
//       insert: jest.fn().mockReturnValueOnce({
//         select: jest.fn().mockReturnValueOnce({
//           single: jest.fn().mockResolvedValue({
//             data: null,
//             error: { message: 'Jadwal gagal' },
//           }),
//         }),
//       }),
//     });

//     await expect(service.create(dto)).rejects.toThrow(
//       new InternalServerErrorException('Gagal menyimpan jadwal: Jadwal gagal'),
//     );
//   });

//   it('should throw error if ekstra insert fails', async () => {
//     (supabase.from as jest.Mock).mockReturnValueOnce({
//       insert: jest.fn().mockReturnValueOnce({
//         select: jest.fn().mockReturnValueOnce({
//           single: jest.fn().mockResolvedValue({
//             data: { id: 'jadwal-1' },
//             error: null,
//           }),
//         }),
//       }),
//     });

//     (supabase.from as jest.Mock).mockReturnValueOnce({
//       insert: jest.fn().mockReturnValueOnce({
//         select: jest.fn().mockReturnValueOnce({
//           single: jest.fn().mockResolvedValue({
//             data: null,
//             error: { message: 'Ekstra gagal' },
//           }),
//         }),
//       }),
//     });

//     await expect(service.create(dto)).rejects.toThrow(
//       new InternalServerErrorException('Gagal menyimpan ekstra: Ekstra gagal'),
//     );
//   });
// });
