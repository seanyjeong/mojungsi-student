"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminNoticesModule = void 0;
const common_1 = require("@nestjs/common");
const admin_notices_controller_1 = require("./admin-notices.controller");
const admin_notices_service_1 = require("./admin-notices.service");
const prisma_module_1 = require("../../prisma/prisma.module");

let AdminNoticesModule = class AdminNoticesModule {
};
exports.AdminNoticesModule = AdminNoticesModule;
exports.AdminNoticesModule = AdminNoticesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [admin_notices_controller_1.AdminNoticesController],
        providers: [admin_notices_service_1.AdminNoticesService],
    })
], AdminNoticesModule);
