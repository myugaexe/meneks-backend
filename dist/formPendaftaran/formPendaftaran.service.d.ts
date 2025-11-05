import { ConfigService } from '@nestjs/config';
export declare class FormPendaftaranService {
    private configService;
    private supabase;
    constructor(configService: ConfigService);
    getById(id: number): Promise<any>;
    getAll(): Promise<any[]>;
    getFormPendaftaranByEkskulId(ekskulId: number, userId: number): Promise<{
        ekstrakurikuler: any;
        profile: any;
    }>;
}
