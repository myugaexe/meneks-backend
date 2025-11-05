import { AnggotaService } from './anggota.service';
export declare class AnggotaController {
    private readonly anggotaService;
    constructor(anggotaService: AnggotaService);
    findAnggotaByEkskul(ekskulId: string): Promise<{
        id: any;
        siswa_id: any;
        status: any;
        register_at: any;
        users: {
            id: any;
            name: any;
            nomorInduk: any;
        }[];
    }[]>;
}
