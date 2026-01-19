import { SaasAuthService } from './saas-auth.service';
export declare class SaasAuthController {
    private authService;
    constructor(authService: SaasAuthService);
    getKakaoLoginUrl(): {
        url: string;
    };
    kakaoCallback(code: string): Promise<{
        accessToken: string;
        user: {
            id: number;
            nickname: string | null;
            email: string | null;
            profileImage: string | null;
        };
    }>;
    getMe(authHeader: string): Promise<{
        user: {
            id: number;
            nickname: string | null;
            email: string | null;
            profileImage: string | null;
        };
    }>;
    withdraw(authHeader: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
