"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const pembina_module_1 = require("./pembina/pembina.module");
const ekstra_module_1 = require("./ekstra/ekstra.module");
const siswa_module_1 = require("./siswa/siswa.module");
const edit_ekstra_module_1 = require("./editEkstra/edit-ekstra.module");
const pendaftaran_module_1 = require("./pendaftaran/pendaftaran.module");
const formPendaftaran_module_1 = require("./formPendaftaran/formPendaftaran.module");
const presensi_module_1 = require("./presensi/presensi.module");
const anggota_module_1 = require("./anggota/anggota.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            auth_module_1.AuthModule,
            pembina_module_1.PembinaModule,
            ekstra_module_1.EkstraModule,
            siswa_module_1.SiswaModule,
            edit_ekstra_module_1.EditEkstraModule,
            pendaftaran_module_1.PendaftaranModule,
            formPendaftaran_module_1.FormPendaftaranModule,
            presensi_module_1.PresensiModule,
            anggota_module_1.AnggotaModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map