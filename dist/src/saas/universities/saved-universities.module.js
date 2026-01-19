"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedUniversitiesModule = void 0;
const common_1 = require("@nestjs/common");
const saved_universities_controller_1 = require("./saved-universities.controller");
const saved_universities_service_1 = require("./saved-universities.service");
const prisma_module_1 = require("../../prisma/prisma.module");
const saas_auth_module_1 = require("../auth/saas-auth.module");
let SavedUniversitiesModule = class SavedUniversitiesModule {
};
exports.SavedUniversitiesModule = SavedUniversitiesModule;
exports.SavedUniversitiesModule = SavedUniversitiesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, saas_auth_module_1.SaasAuthModule],
        controllers: [saved_universities_controller_1.SavedUniversitiesController],
        providers: [saved_universities_service_1.SavedUniversitiesService],
    })
], SavedUniversitiesModule);
//# sourceMappingURL=saved-universities.module.js.map