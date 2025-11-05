"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresensiService = void 0;
const common_1 = require("@nestjs/common");
const supabase_client_1 = require("../supabase/supabase.client");
let PresensiService = class PresensiService {
    async create(dto) {
        const { tanggal, waktu, status_hadir, catatan, pendaftaran_id, noted_by } = dto;
        console.log("DTO received:", dto);
        const { data, error } = await supabase_client_1.supabase
            .from('presensi')
            .insert([
            {
                tanggal,
                waktu,
                status_hadir,
                catatan,
                pendaftaran_id,
                noted_by,
            },
        ])
            .select()
            .single();
        console.log("Supabase insert response:", { data, error });
        if (error) {
            console.error('Insert error:', error);
            throw new Error(error.message);
        }
        return data;
    }
    async findAll() {
        const { data, error } = await supabase_client_1.supabase.from('presensi').select('*');
        if (error) {
            console.error('Fetch error:', error);
            throw new Error(error.message);
        }
        return data;
    }
};
exports.PresensiService = PresensiService;
exports.PresensiService = PresensiService = __decorate([
    (0, common_1.Injectable)()
], PresensiService);
//# sourceMappingURL=presensi.service.js.map