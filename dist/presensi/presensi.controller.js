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
exports.PresensiController = void 0;
const common_1 = require("@nestjs/common");
const presensi_service_1 = require("./presensi.service");
const create_presensi_dto_1 = require("./dto/create-presensi.dto");
let PresensiController = class PresensiController {
    presensiService;
    constructor(presensiService) {
        this.presensiService = presensiService;
    }
    async create(dto) {
        return this.presensiService.create(dto);
    }
    async findAll() {
        return this.presensiService.findAll();
    }
};
exports.PresensiController = PresensiController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_presensi_dto_1.CreatePresensiDto]),
    __metadata("design:returntype", Promise)
], PresensiController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PresensiController.prototype, "findAll", null);
exports.PresensiController = PresensiController = __decorate([
    (0, common_1.Controller)('presensi'),
    __metadata("design:paramtypes", [presensi_service_1.PresensiService])
], PresensiController);
//# sourceMappingURL=presensi.controller.js.map