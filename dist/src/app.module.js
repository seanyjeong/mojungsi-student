"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const universities_module_1 = require("./universities/universities.module");
const calculators_module_1 = require("./calculators/calculators.module");
const formula_configs_module_1 = require("./admin/formula-configs/formula-configs.module");
const universities_module_2 = require("./admin/universities/universities.module");
const auth_module_1 = require("./admin/auth/auth.module");
const jungsi_admin_module_1 = require("./admin/jungsi/jungsi-admin.module");
const saas_auth_module_1 = require("./saas/auth/saas-auth.module");
const profile_module_1 = require("./saas/profile/profile.module");
const scores_module_1 = require("./saas/scores/scores.module");
const saved_universities_module_1 = require("./saas/universities/saved-universities.module");
const practical_module_1 = require("./saas/practical/practical.module");
const notices_module_1 = require("./saas/notices/notices.module");
const admin_notices_module_1 = require("./admin/notices/admin-notices.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            universities_module_1.UniversitiesModule,
            calculators_module_1.CalculatorsModule,
            formula_configs_module_1.FormulaConfigsModule,
            universities_module_2.UniversitiesModule,
            auth_module_1.AuthModule,
            jungsi_admin_module_1.JungsiAdminModule,
            saas_auth_module_1.SaasAuthModule,
            profile_module_1.ProfileModule,
            scores_module_1.ScoresModule,
            saved_universities_module_1.SavedUniversitiesModule,
            practical_module_1.PracticalModule,
            notices_module_1.NoticesModule,
            admin_notices_module_1.AdminNoticesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map