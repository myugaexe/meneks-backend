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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const supabase_js_1 = require("@supabase/supabase-js");
const bcrypt = require("bcrypt");
let AuthService = class AuthService {
    jwtService;
    supabase;
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    async signup(nomorInduk, name, email, password) {
        if (!/^\d{7}$/.test(nomorInduk.toString())) {
            throw new Error('Invalid Identification number');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data, error } = await this.supabase
            .from('users')
            .insert([
            {
                nomorInduk,
                name,
                email,
                password: hashedPassword,
                role: 'siswa',
            },
        ])
            .select()
            .single();
        if (error || !data)
            throw new Error(error.message);
        const payload = {
            sub: data.id,
            email: data.email,
            role: data.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: data.id,
                email: data.email,
                name: data.name,
                nomorInduk: data.nomorInduk,
                role: data.role,
            }
        };
    }
    async signin(email, password) {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (error || !data)
            throw new Error('Invalid credentials');
        const passwordMatch = await bcrypt.compare(password, data.password);
        if (!passwordMatch)
            throw new Error('Wrong password');
        const payload = {
            sub: data.id,
            email: data.email,
            role: data.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: data.id,
                email: data.email,
                name: data.name,
                nomorInduk: data.nomorInduk,
                role: data.role,
            }
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map