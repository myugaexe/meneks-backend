import { PembinaService } from './pembina.service';
export declare class PembinaController {
    private readonly pembinaService;
    constructor(pembinaService: PembinaService);
    getDashboard(req: any): Promise<{
        user: any;
        extracurriculars: any;
    }>;
}
