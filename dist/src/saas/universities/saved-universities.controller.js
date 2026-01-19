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
exports.SavedUniversitiesController = void 0;
const common_1 = require("@nestjs/common");
const saved_universities_service_1 = require("./saved-universities.service");
const saas_auth_guard_1 = require("../auth/saas-auth.guard");
let SavedUniversitiesController = class SavedUniversitiesController {
    savedUnivService;
    constructor(savedUnivService) {
        this.savedUnivService = savedUnivService;
    }
    async getSavedUniversities(req) {
        return this.savedUnivService.getSavedUniversities(req.user.id);
    }
    async toggleSave(req, uId, body) {
        return this.savedUnivService.toggleSave(req.user.id, parseInt(uId), body?.sunung_score);
    }
    async updateSaved(req, uId, body) {
        return this.savedUnivService.updateSavedUniversity(req.user.id, parseInt(uId), body);
    }
    async isSaved(req, uId) {
        const saved = await this.savedUnivService.isSaved(req.user.id, parseInt(uId));
        return { saved };
    }
    async getPracticalScores(uId, year, gender) {
        return this.savedUnivService.getPracticalScoreTable(parseInt(uId), parseInt(year) || 2026, gender);
    }
};
exports.SavedUniversitiesController = SavedUniversitiesController;
__decorate([
    (0, common_1.Get)('saved'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SavedUniversitiesController.prototype, "getSavedUniversities", null);
__decorate([
    (0, common_1.Post)(':uId/toggle'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('uId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SavedUniversitiesController.prototype, "toggleSave", null);
__decorate([
    (0, common_1.Put)(':uId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('uId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SavedUniversitiesController.prototype, "updateSaved", null);
__decorate([
    (0, common_1.Get)(':uId/is-saved'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('uId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SavedUniversitiesController.prototype, "isSaved", null);
__decorate([
    (0, common_1.Get)(':uId/practical-scores'),
    __param(0, (0, common_1.Param)('uId')),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('gender')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SavedUniversitiesController.prototype, "getPracticalScores", null);
exports.SavedUniversitiesController = SavedUniversitiesController = __decorate([
    (0, common_1.Controller)('saas/universities'),
    (0, common_1.UseGuards)(saas_auth_guard_1.SaasAuthGuard),
    __metadata("design:paramtypes", [saved_universities_service_1.SavedUniversitiesService])
], SavedUniversitiesController);
//# sourceMappingURL=saved-universities.controller.js.map