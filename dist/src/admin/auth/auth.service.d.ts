import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private jwtService;
    private adminPasswordHash;
    constructor(jwtService: JwtService);
    private initAdminPassword;
    validateUser(username: string, password: string): Promise<any>;
    login(username: string, password: string): Promise<{
        access_token: string;
        user: {
            username: any;
            role: any;
        };
    }>;
    verifyToken(token: string): Promise<any>;
}
