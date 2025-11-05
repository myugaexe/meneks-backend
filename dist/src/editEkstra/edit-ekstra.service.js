"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditEkstraService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../supabase/supabase.client");
let EditEkstraService = class EditEkstraService {
    async getOne(ekstraId) {
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
      `)
            .eq('id', ekstraId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException('Ekstrakurikuler tidak ditemukan');
        }
        return {
            id: data.id,
            name: data.name,
            description: data.description,
            maxMembers: data.maxAnggota,
            registrationStart: data.periode_start,
            registrationEnd: data.periode_end,
            schedule: {
                id: data.jadwal.id,
                day: data.jadwal.hari,
                startTime: data.jadwal.waktuMulai,
                endTime: data.jadwal.waktuSelesai,
            },
        };
    }
    async update(ekstraId, dto) {
        const { data: oldEkstra, error: findError } = await supabase_client_1.supabase
            .from('ekstra')
            .select('jadwal_id')
            .eq('id', ekstraId)
            .single();
        if (findError || !oldEkstra) {
            throw new common_1.NotFoundException('Ekstrakurikuler tidak ditemukan');
        }
        const jadwalId = oldEkstra.jadwal_id;
        const { error: jadwalError } = await supabase_client_1.supabase
            .from('jadwal')
            .update({
            hari: dto.schedules[0].day,
            waktuMulai: dto.schedules[0].startTime,
            waktuSelesai: dto.schedules[0].endTime,
        })
            .eq('id', jadwalId);
        if (jadwalError) {
            throw new common_1.InternalServerErrorException('Gagal mengupdate jadwal: ' + jadwalError.message);
        }
        const { error: ekstraError } = await supabase_client_1.supabase
            .from('ekstra')
            .update({
            name: dto.name,
            description: dto.description,
            maxAnggota: dto.maxMembers,
            periode_start: dto.registrationStart,
            periode_end: dto.registrationEnd,
        })
            .eq('id', ekstraId);
        if (ekstraError) {
            throw new common_1.InternalServerErrorException('Gagal mengupdate ekstra: ' + ekstraError.message);
        }
        return { message: 'Ekstrakurikuler berhasil diperbarui' };
    }
};
exports.EditEkstraService = EditEkstraService;
exports.EditEkstraService = EditEkstraService = __decorate([
    (0, common_1.Injectable)()
], EditEkstraService);
//# sourceMappingURL=edit-ekstra.service.js.map