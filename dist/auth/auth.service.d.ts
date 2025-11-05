import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly jwtService;
    private supabase;
    constructor(jwtService: JwtService);
    signup(nomorInduk: string, name: string, email: string, password: string): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            nomorInduk: any;
            role: any;
        };
    }>;
    signin(email: string, password: string): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            nomorInduk: any;
            role: any;
        };
    }>;
}
