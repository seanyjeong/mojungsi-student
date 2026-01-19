"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaasAuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const saas_auth_controller_1 = require("./saas-auth.controller");
const saas_auth_service_1 = require("./saas-auth.service");
const saas_auth_guard_1 = require("./saas-auth.guard");
const prisma_module_1 = require("../../prisma/prisma.module");
let SaasAuthModule = class SaasAuthModule {
};
exports.SaasAuthModule = SaasAuthModule;
exports.SaasAuthModule = SaasAuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'fallback-secret',
                signOptions: { expiresIn: '3d' },
            }),
        ],
        controllers: [saas_auth_controller_1.SaasAuthController],
        providers: [saas_auth_service_1.SaasAuthService, saas_auth_guard_1.SaasAuthGuard],
        exports: [saas_auth_service_1.SaasAuthService, saas_auth_guard_1.SaasAuthGuard],
    })
], SaasAuthModule);
//# sourceMappingURL=saas-auth.module.js.map