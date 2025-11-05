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
exports.FormPendaftaranService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("@nestjs/config");
let FormPendaftaranService = class FormPendaftaranService {
    configService;
    supabase;
    constructor(configService) {
        this.configService = configService;
        this.supabase = (0, supabase_js_1.createClient)(this.configService.get('SUPABASE_URL'), this.configService.get('SUPABASE_SERVICE_ROLE_KEY'));
    }
    async getById(id) {
        const { data, error } = await this.supabase
            .from('ekstra')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            throw new common_1.NotFoundException(error.message);
        }
        if (!data) {
            throw new common_1.NotFoundException('Ekstrakurikuler tidak ditemukan');
        }
        return data;
    }
    async getAll() {
        const { data, error } = await this.supabase
            .from('ekstra')
            .select('*');
        if (error) {
            throw new common_1.NotFoundException(error.message);
        }
        return data;
    }
    async getFormPendaftaranByEkskulId(ekskulId, userId) {
        const { data: ekstrakurikuler, error: ekskulError } = await this.supabase
            .from('ekstra')
            .select('*')
            .eq('id', ekskulId)
            .single();
        if (ekskulError) {
            throw new common_1.NotFoundException(`Ekstrakurikuler tidak ditemukan: ${ekskulError.message}`);
        }
        const { data: profile, error: profileError } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        if (profileError) {
            throw new common_1.NotFoundException(`Profil siswa tidak ditemukan: ${profileError.message}`);
        }
        return {
            ekstrakurikuler,
            profile,
        };
    }
};
exports.FormPendaftaranService = FormPendaftaranService;
exports.FormPendaftaranService = FormPendaftaranService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FormPendaftaranService);
//# sourceMappingURL=formPendaftaran.service.js.map