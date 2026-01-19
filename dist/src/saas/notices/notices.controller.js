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
exports.NoticesController = void 0;
const common_1 = require("@nestjs/common");
const notices_service_1 = require("./notices.service");
const saas_auth_guard_1 = require("../auth/saas-auth.guard");
const saas_optional_auth_guard_1 = require("../auth/saas-optional-auth.guard");

let NoticesController = class NoticesController {
    noticesService;
    constructor(noticesService) {
        this.noticesService = noticesService;
    }

    // 공지 목록 조회
    async getNotices(req) {
        return this.noticesService.getNotices(req.user.id);
    }

    // 최신 공지 3개 (대시보드용 - 공개 API, 로그인 선택)
    async getLatestNotices(req) {
        const userId = req.user?.id || null;
        return this.noticesService.getLatestNotices(userId);
    }

    // 읽지 않은 공지 개수
    async getUnreadCount(req) {
        const count = await this.noticesService.getUnreadCount(req.user.id);
        return { count };
    }

    // 공지 상세 조회
    async getNotice(id, req) {
        return this.noticesService.getNotice(parseInt(id), req.user.id);
    }

    // 읽음 표시
    async markAsRead(id, req) {
        return this.noticesService.markAsRead(parseInt(id), req.user.id);
    }
};
exports.NoticesController = NoticesController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(saas_auth_guard_1.SaasAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NoticesController.prototype, "getNotices", null);
__decorate([
    (0, common_1.Get)('latest'),
    (0, common_1.UseGuards)(saas_optional_auth_guard_1.SaasOptionalAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NoticesController.prototype, "getLatestNotices", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, common_1.UseGuards)(saas_auth_guard_1.SaasAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NoticesController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(saas_auth_guard_1.SaasAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NoticesController.prototype, "getNotice", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    (0, common_1.UseGuards)(saas_auth_guard_1.SaasAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NoticesController.prototype, "markAsRead", null);
exports.NoticesController = NoticesController = __decorate([
    (0, common_1.Controller)('saas/notices'),
    __metadata("design:paramtypes", [notices_service_1.NoticesService])
], NoticesController);
