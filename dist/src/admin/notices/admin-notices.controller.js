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
exports.AdminNoticesController = void 0;
const common_1 = require("@nestjs/common");
const admin_notices_service_1 = require("./admin-notices.service");

let AdminNoticesController = class AdminNoticesController {
    noticesService;
    constructor(noticesService) {
        this.noticesService = noticesService;
    }

    // 공지 목록 조회
    async getNotices() {
        return this.noticesService.getNotices();
    }

    // 공지 상세 조회
    async getNotice(id) {
        return this.noticesService.getNotice(parseInt(id));
    }

    // 공지 생성
    async createNotice(body) {
        return this.noticesService.createNotice(body);
    }

    // 공지 수정
    async updateNotice(id, body) {
        return this.noticesService.updateNotice(parseInt(id), body);
    }

    // 공지 삭제
    async deleteNotice(id) {
        return this.noticesService.deleteNotice(parseInt(id));
    }

    // 활성화/비활성화 토글
    async toggleActive(id) {
        return this.noticesService.toggleActive(parseInt(id));
    }
};
exports.AdminNoticesController = AdminNoticesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminNoticesController.prototype, "getNotices", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminNoticesController.prototype, "getNotice", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminNoticesController.prototype, "createNotice", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminNoticesController.prototype, "updateNotice", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminNoticesController.prototype, "deleteNotice", null);
__decorate([
    (0, common_1.Patch)(':id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminNoticesController.prototype, "toggleActive", null);
exports.AdminNoticesController = AdminNoticesController = __decorate([
    (0, common_1.Controller)('admin/notices'),
    __metadata("design:paramtypes", [admin_notices_service_1.AdminNoticesService])
], AdminNoticesController);
