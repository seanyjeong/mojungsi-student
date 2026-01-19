import { AuthService } from './auth.service';
declare class LoginDto {
    username: string;
    password: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            username: any;
            role: any;
        };
    }>;
    verify(authHeader: string): Promise<{
        valid: boolean;
        user: any;
    }>;
}
export {};
