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
exports.ScoresController = void 0;
const common_1 = require("@nestjs/common");
const scores_service_1 = require("./scores.service");
const saas_auth_guard_1 = require("../auth/saas-auth.guard");
let ScoresController = class ScoresController {
    scoresService;
    constructor(scoresService) {
        this.scoresService = scoresService;
    }
    async getScores(req) {
        return this.scoresService.getScores(req.user.id);
    }
    async getScoreByExamType(req, examType, year) {
        const yearNum = year ? parseInt(year) : 2026;
        return this.scoresService.getScoreByExamType(req.user.id, examType, yearNum);
    }
    async saveScore(req, body) {
        if (!body.examType || !body.scores) {
            throw new common_1.HttpException('examType and scores are required', common_1.HttpStatus.BAD_REQUEST);
        }
        const year = body.year || 2026;
        return this.scoresService.upsertScore(req.user.id, body.examType, body.scores, year);
    }
    async deleteScore(req, examType, year) {
        const yearNum = year ? parseInt(year) : 2026;
        return this.scoresService.deleteScore(req.user.id, examType, yearNum);
    }
};
exports.ScoresController = ScoresController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ScoresController.prototype, "getScores", null);
__decorate([
    (0, common_1.Get)(':examType'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('examType')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ScoresController.prototype, "getScoreByExamType", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ScoresController.prototype, "saveScore", null);
__decorate([
    (0, common_1.Delete)(':examType'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('examType')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ScoresController.prototype, "deleteScore", null);
exports.ScoresController = ScoresController = __decorate([
    (0, common_1.Controller)('saas/scores'),
    (0, common_1.UseGuards)(saas_auth_guard_1.SaasAuthGuard),
    __metadata("design:paramtypes", [scores_service_1.ScoresService])
], ScoresController);
//# sourceMappingURL=scores.controller.js.map