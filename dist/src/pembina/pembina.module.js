"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PembinaModule = void 0;
const common_1 = require("@nestjs/common");
const pembina_controller_1 = require("./pembina.controller");
const pembina_service_1 = require("./pembina.service");
let PembinaModule = class PembinaModule {
};
exports.PembinaModule = PembinaModule;
exports.PembinaModule = PembinaModule = __decorate([
    (0, common_1.Module)({
        controllers: [pembina_controller_1.PembinaController],
        providers: [pembina_service_1.PembinaService],
    })
], PembinaModule);
//# sourceMappingURL=pembina.module.js.map