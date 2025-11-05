export declare enum AttendanceStatus {
    HADIR = "hadir",
    TIDAK_HADIR = "tidak_hadir",
    IZIN = "izin",
    SAKIT = "sakit"
}
export declare class CreatePresensiDto {
    tanggal: string;
    waktu: string;
    status_hadir: AttendanceStatus;
    catatan?: string;
    pendaftaran_id: number;
    noted_by: number;
}
