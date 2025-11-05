import { SiswaService } from './siswa.service';
export declare class SiswaController {
    private readonly siswaService;
    constructor(siswaService: SiswaService);
    getDashboard(req: any): Promise<{
        user: any;
        allExtracurriculars: any;
        myExtracurriculars: any;
    }>;
}
