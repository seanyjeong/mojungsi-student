"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaasAuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
let SaasAuthService = class SaasAuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    getKakaoLoginUrl() {
        const clientId = process.env.KAKAO_REST_API_KEY || '';
        const redirectUri = process.env.KAKAO_REDIRECT_URI || '';
        return `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    }
    async getKakaoToken(code) {
        const clientId = process.env.KAKAO_REST_API_KEY || '';
        const redirectUri = process.env.KAKAO_REDIRECT_URI || '';
        const clientSecret = process.env.KAKAO_CLIENT_SECRET || '';
        const params = {
            grant_type: 'authorization_code',
            client_id: clientId,
            redirect_uri: redirectUri,
            code,
        };
        if (clientSecret) {
            params.client_secret = clientSecret;
        }
        const response = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(params),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`카카오 토큰 발급 실패: ${error}`);
        }
        return response.json();
    }
    async getKakaoUserInfo(accessToken) {
        const response = await fetch('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`카카오 사용자 정보 조회 실패: ${error}`);
        }
        return response.json();
    }
    async handleKakaoLogin(code) {
        const tokenData = await this.getKakaoToken(code);
        const kakaoUser = await this.getKakaoUserInfo(tokenData.access_token);
        const nickname = kakaoUser.kakao_account?.profile?.nickname
            || kakaoUser.properties?.nickname
            || '사용자';
        const email = kakaoUser.kakao_account?.email || null;
        const profileImage = kakaoUser.kakao_account?.profile?.profile_image_url
            || kakaoUser.properties?.profile_image
            || null;
        let user = await this.prisma.saas_users.findUnique({
            where: { kakao_id: BigInt(kakaoUser.id) },
        });
        if (user) {
            user = await this.prisma.saas_users.update({
                where: { id: user.id },
                data: {
                    nickname,
                    email,
                    profile_image: profileImage,
                    last_login: new Date(),
                },
            });
        }
        else {
            user = await this.prisma.saas_users.create({
                data: {
                    kakao_id: BigInt(kakaoUser.id),
                    nickname,
                    email,
                    profile_image: profileImage,
                    last_login: new Date(),
                },
            });
        }
        const jwtPayload = {
            sub: user.id,
            kakaoId: user.kakao_id.toString(),
            nickname: user.nickname,
        };
        const accessToken = this.jwtService.sign(jwtPayload);
        return {
            accessToken,
            user: {
                id: user.id,
                nickname: user.nickname,
                email: user.email,
                profileImage: user.profile_image,
            },
        };
    }
    async verifyToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.prisma.saas_users.findUnique({
                where: { id: payload.sub },
            });
            if (!user) {
                throw new Error('사용자를 찾을 수 없습니다');
            }
            return {
                id: user.id,
                nickname: user.nickname,
                email: user.email,
                profileImage: user.profile_image,
            };
        }
        catch (error) {
            throw new Error('유효하지 않은 토큰입니다');
        }
    }
    async withdrawUser(token) {
        const payload = this.jwtService.verify(token);
        const userId = payload.sub;
        await this.prisma.$transaction([
            this.prisma.saas_saved_scores.deleteMany({ where: { user_id: userId } }),
            this.prisma.saas_saved_universities.deleteMany({ where: { user_id: userId } }),
            this.prisma.saas_practical_records.deleteMany({ where: { user_id: userId } }),
            this.prisma.saas_users.delete({ where: { id: userId } }),
        ]);
        return { success: true };
    }
};
exports.SaasAuthService = SaasAuthService;
exports.SaasAuthService = SaasAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], SaasAuthService);
//# sourceMappingURL=saas-auth.service.js.map