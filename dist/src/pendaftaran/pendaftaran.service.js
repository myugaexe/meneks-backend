"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendaftaranService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("@nestjs/config");
let PendaftaranService = class PendaftaranService {
    configService;
    supabase;
    MAX_EKSTRA_REGISTRATIONS = 2;
    constructor(configService) {
        this.configService = configService;
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_SERVICE_ROLE_KEY'));
    }
    async create(dto) {
        const { data: existing, error: fetchError } = await this.supabase
            .from('pendaftaran')
            .select('*')
            .eq('siswa_id', dto.siswa_id)
            .eq('eksul_id', dto.eksul_id)
            .single();
        if (fetchError && fetchError.code !== 'PGRST116') {
            throw new common_1.BadRequestException(fetchError.message);
        }
        if (existing) {
            throw new common_1.BadRequestException('Siswa sudah terdaftar di ekstrakurikuler ini.');
        }
        const { count: registeredCount, error: countError } = await this.supabase
            .from('pendaftaran')
            .select('id', { count: 'exact' })
            .eq('siswa_id', dto.siswa_id);
        if (countError) {
            throw new common_1.BadRequestException(`Gagal menghitung pendaftaran siswa: ${countError.message}`);
        }
        if (registeredCount && registeredCount >= this.MAX_EKSTRA_REGISTRATIONS) {
            throw new common_1.BadRequestException(`Siswa sudah mendaftar ${this.MAX_EKSTRA_REGISTRATIONS} ekstrakurikuler dan tidak bisa mendaftar lebih banyak.`);
        }
        const { data: ekskul, error: ekskulError } = await this.supabase
            .from('ekstra')
            .select('periode_start, periode_end, maxAnggota, JumlahAnggota')
            .eq('id', dto.eksul_id)
            .single();
        if (ekskulError) {
            throw new common_1.BadRequestException(`Gagal mengambil data ekstrakurikuler: ${ekskulError.message}`);
        }
        if (!ekskul ||
            !ekskul.periode_start ||
            !ekskul.periode_end ||
            ekskul.maxAnggota === undefined ||
            ekskul.JumlahAnggota === undefined) {
            throw new common_1.BadRequestException('Data ekstrakurikuler tidak lengkap.');
        }
        const today = new Date();
        const periodeEnd = new Date(ekskul.periode_end);
        if (today > periodeEnd) {
            throw new common_1.BadRequestException('Pendaftaran sudah ditutup karena periode sudah berakhir.');
        }
        if (ekskul.JumlahAnggota >= ekskul.maxAnggota) {
            throw new common_1.BadRequestException('Kuota ekstrakurikuler sudah penuh.');
        }
        const { data, error } = await this.supabase
            .from('pendaftaran')
            .insert([
            {
                siswa_id: dto.siswa_id,
                eksul_id: dto.eksul_id,
                status: 'aktif',
                register_at: new Date().toTimeString().split(' ')[0],
            },
        ])
            .select()
            .single();
        if (error) {
            throw new common_1.BadRequestException(error.message);
        }
        return data;
    }
};
exports.PendaftaranService = PendaftaranService;
exports.PendaftaranService = PendaftaranService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PendaftaranService);
//# sourceMappingURL=pendaftaran.service.js.map