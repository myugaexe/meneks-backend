export declare class PembinaService {
    private supabase;
    constructor();
    getDashboardData(userId: string): Promise<{
        user: any;
        extracurriculars: any;
    }>;
}
