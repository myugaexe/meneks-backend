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
exports.EditEkstraController = void 0;
const common_1 = require("@nestjs/common");
const edit_ekstra_service_1 = require("./edit-ekstra.service");
const update_ekstra_dto_1 = require("./dto/update-ekstra.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let EditEkstraController = class EditEkstraController {
    editEkstraService;
    constructor(editEkstraService) {
        this.editEkstraService = editEkstraService;
    }
    async updateEkstra(id, dto) {
        return this.editEkstraService.update(id, dto);
    }
    async getEkstra(id) {
        return this.editEkstraService.getOne(id);
    }
};
exports.EditEkstraController = EditEkstraController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_ekstra_dto_1.UpdateEkstraDto]),
    __metadata("design:returntype", Promise)
], EditEkstraController.prototype, "updateEkstra", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EditEkstraController.prototype, "getEkstra", null);
exports.EditEkstraController = EditEkstraController = __decorate([
    (0, common_1.Controller)('editEkstra'),
    __metadata("design:paramtypes", [edit_ekstra_service_1.EditEkstraService])
], EditEkstraController);
//# sourceMappingURL=edit-ekstra.controller.js.map