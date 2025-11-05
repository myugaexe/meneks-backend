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
exports.PembinaService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
let PembinaService = class PembinaService {
    supabase;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    async getDashboardData(userId) {
        const { data: user, error: userError } = await this.supabase
            .from('users')
            .select('id, name, role, nomorInduk')
            .eq('id', userId)
            .single();
        if (userError)
            throw new Error(userError.message);
        const { data: extracurriculars, error: ekskulError } = await this.supabase
            .from('ekstra')
            .select(`
            *,
            jadwal (
            *
            )
        `)
            .eq('pembina_id', userId);
        if (ekskulError)
            throw new Error(ekskulError.message);
        return {
            user,
            extracurriculars,
        };
    }
};
exports.PembinaService = PembinaService;
exports.PembinaService = PembinaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PembinaService);
//# sourceMappingURL=pembina.service.js.map