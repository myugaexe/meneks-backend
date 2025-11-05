"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EkstraService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../supabase/supabase.client");
let EkstraService = class EkstraService {
    async findAll() {
        const { data, error } = await supabase_client_1.supabase
            .from('ekstra')
            .select(`
        *,
        jadwal (
          id,
          hari,
          waktuMulai,
          waktuSelesai
        )
      `);
        if (error) {
            console.error('Gagal ambil daftar ekstra:', error);
            throw new common_1.InternalServerErrorException('Gagal mengambil data ekstrakurikuler: ' + error.message);
        }
        return data;
    }
    async create(dto) {
        const { data: jadwal, error: jadwalError } = await supabase_client_1.supabase
            .from('jadwal')
            .insert([
            {
                hari: dto.schedules[0].day,
                waktuMulai: dto.schedules[0].startTime,
                waktuSelesai: dto.schedules[0].endTime,
            },
        ])
            .select()
            .single();
        if (jadwalError) {
            console.error('Gagal simpan jadwal:', jadwalError);
            throw new common_1.InternalServerErrorException('Gagal menyimpan jadwal: ' + jadwalError.message);
        }
        const { data: ekstra, error: ekstraError } = await supabase_client_1.supabase
            .from('ekstra')
            .insert([
            {
                name: dto.name,
                description: dto.description,
                periode_start: dto.registrationStart,
                periode_end: dto.registrationEnd,
                maxAnggota: dto.maxMembers,
                jadwal_id: jadwal.id,
                pembina_id: dto.pembinaId,
            },
        ])
            .select()
            .single();
        if (ekstraError) {
            console.error('Gagal simpan ekstra:', ekstraError);
            throw new common_1.InternalServerErrorException('Gagal menyimpan ekstra: ' + ekstraError.message);
        }
        return {
            message: 'Ekstrakurikuler dan jadwal berhasil dibuat',
            ekstra,
            jadwal,
        };
    }
};
exports.EkstraService = EkstraService;
exports.EkstraService = EkstraService = __decorate([
    (0, common_1.Injectable)()
], EkstraService);
//# sourceMappingURL=ekstra.service.js.map