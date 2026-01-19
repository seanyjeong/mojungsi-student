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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaasAuthController = void 0;
const common_1 = require("@nestjs/common");
const saas_auth_service_1 = require("./saas-auth.service");
let SaasAuthController = class SaasAuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    getKakaoLoginUrl() {
        return { url: this.authService.getKakaoLoginUrl() };
    }
    async kakaoCallback(code) {
        if (!code) {
            throw new common_1.UnauthorizedException('인가 코드가 필요합니다');
        }
        try {
            const result = await this.authService.handleKakaoLogin(code);
            return result;
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`로그인 실패: ${error.message}`);
        }
    }
    async getMe(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('인증 토큰이 필요합니다');
        }
        const token = authHeader.replace('Bearer ', '');
        try {
            const user = await this.authService.verifyToken(token);
            return { user };
        }
        catch (error) {
            throw new common_1.UnauthorizedException(error.message);
        }
    }
    async withdraw(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('인증 토큰이 필요합니다');
        }
        const token = authHeader.replace('Bearer ', '');
        try {
            await this.authService.withdrawUser(token);
            return { success: true, message: '회원탈퇴가 완료되었습니다' };
        }
        catch (error) {
            throw new common_1.UnauthorizedException(error.message);
        }
    }
};
exports.SaasAuthController = SaasAuthController;
__decorate([
    (0, common_1.Get)('kakao/login-url'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SaasAuthController.prototype, "getKakaoLoginUrl", null);
__decorate([
    (0, common_1.Get)('kakao/callback'),
    __param(0, (0, common_1.Query)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SaasAuthController.prototype, "kakaoCallback", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SaasAuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Delete)('withdraw'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SaasAuthController.prototype, "withdraw", null);
exports.SaasAuthController = SaasAuthController = __decorate([
    (0, common_1.Controller)('saas/auth'),
    __metadata("design:paramtypes", [saas_auth_service_1.SaasAuthService])
], SaasAuthController);
//# sourceMappingURL=saas-auth.controller.js.map