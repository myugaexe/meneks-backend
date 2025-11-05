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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendaftaranController = void 0;
const common_1 = require("@nestjs/common");
const pendaftaran_service_1 = require("./pendaftaran.service");
const create_pendaftaran_dto_1 = require("./dto/create-pendaftaran.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PendaftaranController = class PendaftaranController {
    pendaftaranService;
    constructor(pendaftaranService) {
        this.pendaftaranService = pendaftaranService;
    }
    async create(dto, req) {
        const siswa_id = req.user.userId;
        if (!siswa_id) {
            throw new Error('User id tidak ditemukan dalam token');
        }
        return this.pendaftaranService.create({
            ...dto,
            siswa_id,
        });
    }
};
exports.PendaftaranController = PendaftaranController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pendaftaran_dto_1.CreatePendaftaranDto, Object]),
    __metadata("design:returntype", Promise)
], PendaftaranController.prototype, "create", null);
exports.PendaftaranController = PendaftaranController = __decorate([
    (0, common_1.Controller)('pendaftaran'),
    __metadata("design:paramtypes", [pendaftaran_service_1.PendaftaranService])
], PendaftaranController);
//# sourceMappingURL=pendaftaran.controller.js.map