import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePendaftaranDto {
  @IsInt()
  @IsNotEmpty()
  eksul_id: number;

  @IsInt()
  @IsOptional()
  siswa_id?: number; // ditambahkan, diisi dari req.user
}
