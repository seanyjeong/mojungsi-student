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
exports.SaasOptionalAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const saas_auth_service_1 = require("./saas-auth.service");

let SaasOptionalAuthGuard = class SaasOptionalAuthGuard {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        // 토큰이 없으면 그냥 통과 (user는 undefined)
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return true;
        }

        const token = authHeader.substring(7);
        try {
            const user = await this.authService.verifyToken(token);
            request.user = user;
        }
        catch (error) {
            // 토큰이 유효하지 않아도 그냥 통과
        }
        return true;
    }
};
exports.SaasOptionalAuthGuard = SaasOptionalAuthGuard;
exports.SaasOptionalAuthGuard = SaasOptionalAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [saas_auth_service_1.SaasAuthService])
], SaasOptionalAuthGuard);
