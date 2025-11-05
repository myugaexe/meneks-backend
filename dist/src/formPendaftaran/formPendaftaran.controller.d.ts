import { FormPendaftaranService } from './formPendaftaran.service';
export declare class FormPendaftaranController {
    private readonly formPendaftaranService;
    constructor(formPendaftaranService: FormPendaftaranService);
    getFormPendaftaran(ekskulId: string, userId: string): Promise<{
        ekstrakurikuler: any;
        profile: any;
    }>;
}
