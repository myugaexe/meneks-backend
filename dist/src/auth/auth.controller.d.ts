import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(body: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            nomorInduk: any;
            role: any;
        };
    }>;
    signin(body: any): Promise<{
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
