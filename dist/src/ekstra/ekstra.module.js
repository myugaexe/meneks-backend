"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EkstraModule = void 0;
const common_1 = require("@nestjs/common");
const ekstra_service_1 = require("./ekstra.service");
const ekstra_controller_1 = require("./ekstra.controller");
let EkstraModule = class EkstraModule {
};
exports.EkstraModule = EkstraModule;
exports.EkstraModule = EkstraModule = __decorate([
    (0, common_1.Module)({
        controllers: [ekstra_controller_1.EkstraController],
        providers: [ekstra_service_1.EkstraService],
    })
], EkstraModule);
//# sourceMappingURL=ekstra.module.js.map