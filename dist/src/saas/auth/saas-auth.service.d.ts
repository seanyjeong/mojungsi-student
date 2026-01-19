import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
interface KakaoTokenResponse {
    access_token: string;
    token_type: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
}
interface KakaoUserInfo {
    id: number;
    kakao_account?: {
        email?: string;
        profile?: {
            nickname?: string;
            profile_image_url?: string;
        };
    };
    properties?: {
        nickname?: string;
        profile_image?: string;
    };
}
export declare class SaasAuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    getKakaoLoginUrl(): string;
    getKakaoToken(code: string): Promise<KakaoTokenResponse>;
    getKakaoUserInfo(accessToken: string): Promise<KakaoUserInfo>;
    handleKakaoLogin(code: string): Promise<{
        accessToken: string;
        user: {
            id: number;
            nickname: string | null;
            email: string | null;
            profileImage: string | null;
        };
    }>;
    verifyToken(token: string): Promise<{
        id: number;
        nickname: string | null;
        email: string | null;
        profileImage: string | null;
    }>;
    withdrawUser(token: string): Promise<{
        success: boolean;
    }>;
}
export {};
