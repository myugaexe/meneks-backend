import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Matches } from 'class-validator';

export enum AttendanceStatus {
  HADIR = 'hadir',
  TIDAK_HADIR = 'tidak_hadir',
  IZIN = 'izin',
  SAKIT = 'sakit',
}

export class CreatePresensiDto {
  @IsDateString()
  tanggal: string; // Format: YYYY-MM-DD

  // Validasi waktu sebagai string "HH:mm:ss"
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'waktu harus dalam format HH:mm:ss',
  })
  waktu: string;

  @IsEnum(AttendanceStatus, {
    message: 'status_hadir harus salah satu dari: hadir, tidak_hadir, izin, sakit',
  })
  status_hadir: AttendanceStatus;

  @IsOptional()
  @IsString()
  catatan?: string;

  @IsInt()
  pendaftaran_id: number;

  @IsInt()
  noted_by: number;
}
