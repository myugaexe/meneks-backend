export declare class SiswaService {
    private supabase;
    constructor();
    getDashboardData(userId: number): Promise<{
        user: any;
        allExtracurriculars: any;
        myExtracurriculars: any;
    }>;
}
