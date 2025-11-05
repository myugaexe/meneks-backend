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
exports.CreatePresensiDto = exports.AttendanceStatus = void 0;
const class_validator_1 = require("class-validator");
var AttendanceStatus;
(function (AttendanceStatus) {
    AttendanceStatus["HADIR"] = "hadir";
    AttendanceStatus["TIDAK_HADIR"] = "tidak_hadir";
    AttendanceStatus["IZIN"] = "izin";
    AttendanceStatus["SAKIT"] = "sakit";
})(AttendanceStatus || (exports.AttendanceStatus = AttendanceStatus = {}));
class CreatePresensiDto {
    tanggal;
    waktu;
    status_hadir;
    catatan;
    pendaftaran_id;
    noted_by;
}
exports.CreatePresensiDto = CreatePresensiDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePresensiDto.prototype, "tanggal", void 0);
__decorate([
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
        message: 'waktu harus dalam format HH:mm:ss',
    }),
    __metadata("design:type", String)
], CreatePresensiDto.prototype, "waktu", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AttendanceStatus, {
        message: 'status_hadir harus salah satu dari: hadir, tidak_hadir, izin, sakit',
    }),
    __metadata("design:type", String)
], CreatePresensiDto.prototype, "status_hadir", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePresensiDto.prototype, "catatan", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePresensiDto.prototype, "pendaftaran_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePresensiDto.prototype, "noted_by", void 0);
//# sourceMappingURL=create-presensi.dto.js.map