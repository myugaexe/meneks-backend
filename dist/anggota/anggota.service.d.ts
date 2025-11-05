export declare class AnggotaService {
    findByEkskul(ekskulId: number): Promise<{
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
