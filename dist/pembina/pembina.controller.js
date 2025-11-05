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
exports.PembinaController = void 0;
const common_1 = require("@nestjs/common");
const pembina_service_1 = require("./pembina.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PembinaController = class PembinaController {
    pembinaService;
    constructor(pembinaService) {
        this.pembinaService = pembinaService;
    }
    async getDashboard(req) {
        const userId = req.user.userId;
        return this.pembinaService.getDashboardData(userId);
    }
};
exports.PembinaController = PembinaController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PembinaController.prototype, "getDashboard", null);
exports.PembinaController = PembinaController = __decorate([
    (0, common_1.Controller)('pembina'),
    __metadata("design:paramtypes", [pembina_service_1.PembinaService])
], PembinaController);
//# sourceMappingURL=pembina.controller.js.map