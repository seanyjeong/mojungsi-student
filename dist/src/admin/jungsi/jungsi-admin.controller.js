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
exports.JungsiAdminController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const jungsi_admin_service_1 = require("./jungsi-admin.service");
class SubjectRatiosDto {
    국어;
    수학;
    영어;
    탐구;
    탐구수;
}
class GradeScoresDto {
    '1';
    '2';
    '3';
    '4';
    '5';
    '6';
    '7';
    '8';
    '9';
}
class SelectionRuleDto {
    type;
    from;
    count;
    weights;
}
class HighestScoreDto {
    subject_name;
    max_score;
}
class BulkHighestScoresDto {
    scores;
}
class InquiryConvDto {
    track;
    scores;
}
class PracticalScoreDto {
    event_name;
    gender;
    record;
    score;
}
class CopyYearDto {
    fromYear;
    toYear;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CopyYearDto.prototype, "fromYear", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CopyYearDto.prototype, "toYear", void 0);
let JungsiAdminController = class JungsiAdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getBasicList(year) {
        const list = await this.adminService.getBasicList(year);
        return { success: true, count: list.length, list };
    }
    async getBasicById(U_ID) {
        const basic = await this.adminService.getBasicById(U_ID);
        return { success: true, data: basic };
    }
    async updateBasic(U_ID, data) {
        const result = await this.adminService.updateBasic(U_ID, data);
        return { success: true, data: result };
    }
    async getRatio(U_ID) {
        const ratio = await this.adminService.getRatio(U_ID);
        return { success: true, data: ratio };
    }
    async updateSubjectRatios(U_ID, data) {
        const result = await this.adminService.updateSubjectRatios(U_ID, data);
        return { success: true, message: '과목 비율이 수정되었습니다.' };
    }
    async updateEnglishScores(U_ID, scores) {
        const result = await this.adminService.updateEnglishScores(U_ID, scores);
        return { success: true, message: '영어 등급 배점이 수정되었습니다.' };
    }
    async updateHistoryScores(U_ID, scores) {
        const result = await this.adminService.updateHistoryScores(U_ID, scores);
        return { success: true, message: '한국사 등급 배점이 수정되었습니다.' };
    }
    async updateSelectionRules(U_ID, rules) {
        const result = await this.adminService.updateSelectionRules(U_ID, rules);
        return { success: true, message: '선택반영 규칙이 수정되었습니다.' };
    }
    async updateSpecialFormula(U_ID, formula) {
        const result = await this.adminService.updateSpecialFormula(U_ID, formula);
        return { success: true, message: '특수공식이 수정되었습니다.' };
    }
    async updateBonusRules(U_ID, rules) {
        await this.adminService.updateBonusRules(U_ID, rules);
        return { success: true, message: '가산점 규칙이 수정되었습니다.' };
    }
    async updateScoreConfig(U_ID, config) {
        await this.adminService.updateScoreConfig(U_ID, config);
        return { success: true, message: '점수 설정이 수정되었습니다.' };
    }
    async updateCalcMethod(U_ID, data) {
        await this.adminService.updateCalcMethod(U_ID, data);
        return { success: true, message: '계산방식이 수정되었습니다.' };
    }
    async updateTotalScore(U_ID, totalScore) {
        await this.adminService.updateTotalScore(U_ID, totalScore);
        return { success: true, message: '총점이 수정되었습니다.' };
    }
    async updateEtcSettings(U_ID, settings) {
        await this.adminService.updateEtcSettings(U_ID, settings);
        return { success: true, message: '기타 설정이 수정되었습니다.' };
    }
    async updateEtcNote(U_ID, note) {
        await this.adminService.updateEtcNote(U_ID, note);
        return { success: true, message: '기타 노트가 수정되었습니다.' };
    }
    async updateMainRatios(U_ID, data) {
        await this.adminService.updateMainRatios(U_ID, data);
        return { success: true, message: '수능/내신/실기 비율이 수정되었습니다.' };
    }
    async bulkUpdate(body) {
        const results = await this.adminService.bulkUpdate(body.year, body.data);
        return {
            success: true,
            message: `${results.updated}개 학과가 업데이트되었습니다.`,
            ...results,
        };
    }
    async exportAll(year) {
        const data = await this.adminService.exportAll(year);
        return { success: true, year, data };
    }
    async getHighestScores(year, mohyung = '수능') {
        const scores = await this.adminService.getHighestScores(year, mohyung);
        return { success: true, year, mohyung, scores };
    }
    async bulkUpdateHighestScores(year, mohyung = '수능', body) {
        const results = await this.adminService.bulkUpdateHighestScores(year, mohyung, body.scores);
        return { success: true, message: '최고표점이 수정되었습니다.', count: results.length };
    }
    async getInquiryConv(U_ID, year, exam_type = '수능') {
        const conv = await this.adminService.getInquiryConv(U_ID, year, exam_type);
        const availableTypes = await this.adminService.getAvailableExamTypes(U_ID, year);
        return { success: true, data: conv, availableExamTypes: availableTypes };
    }
    async updateInquiryConv(U_ID, year, body) {
        const exam_type = body.exam_type || '수능';
        const result = await this.adminService.updateInquiryConv(U_ID, year, exam_type, body.track, body.scores);
        return { success: true, message: `${exam_type} ${body.track} 변환표준점수가 수정되었습니다.` };
    }
    // 변환표 복사 (수능 → 다른 모의고사)
    async copyInquiryConv(U_ID, year, body) {
        const result = await this.adminService.copyInquiryConv(U_ID, year, body.from, body.to);
        return { success: true, message: `${body.from} → ${body.to} 복사 완료`, count: result.count };
    }
    // 변환표 있는 학교 목록
    async getUniversitiesWithInquiryConv(year) {
        const list = await this.adminService.getUniversitiesWithInquiryConv(year);
        return { success: true, count: list.length, list };
    }
    // 엑셀 내보내기용 데이터
    async getInquiryConvForExport(year, uid) {
        const data = await this.adminService.getInquiryConvForExport(year, uid || null);
        return { success: true, count: data.length, data };
    }
    // 엑셀 업로드
    async bulkImportInquiryConv(year, body) {
        const result = await this.adminService.bulkImportInquiryConv(year, body.data);
        return { success: true, ...result };
    }
    async getPracticalScores(U_ID, year) {
        const scores = await this.adminService.getPracticalScores(U_ID, year);
        return { success: true, data: scores };
    }
    async addPracticalScore(U_ID, year, body) {
        const result = await this.adminService.addPracticalScore(U_ID, year, body);
        return { success: true, data: result };
    }
    async updatePracticalScore(id, body) {
        const result = await this.adminService.updatePracticalScore(id, body);
        return { success: true, data: result };
    }
    async deletePracticalScore(id) {
        await this.adminService.deletePracticalScore(id);
        return { success: true, message: '삭제되었습니다.' };
    }
    async getFullDetails(U_ID, year) {
        const details = await this.adminService.getFullDetails(U_ID, year);
        return { success: true, data: details };
    }
    async copyYearData(body) {
        const result = await this.adminService.copyYearData(body.fromYear, body.toYear);
        return { success: true, ...result };
    }
    // 활성 연도 조회
    async getActiveYear() {
        const year = await this.adminService.getActiveYear();
        return { success: true, activeYear: year };
    }
    // 활성 연도 설정
    async setActiveYear(year) {
        const result = await this.adminService.setActiveYear(year);
        return result;
    }
};
exports.JungsiAdminController = JungsiAdminController;
__decorate([
    (0, common_1.Get)('basic'),
    (0, swagger_1.ApiOperation)({ summary: '대학/학과 목록 조회' }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number, description: '학년도' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '조회 성공' }),
    __param(0, (0, common_1.Query)('year', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "getBasicList", null);
__decorate([
    (0, common_1.Get)('basic/:U_ID'),
    (0, swagger_1.ApiOperation)({ summary: '학과 기본 정보 조회' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number, description: '대학 고유 ID' }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "getBasicById", null);
__decorate([
    (0, common_1.Put)('basic/:U_ID'),
    (0, swagger_1.ApiOperation)({ summary: '학과 기본 정보 수정' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "updateBasic", null);
__decorate([
    (0, common_1.Get)('ratio/:U_ID'),
    (0, swagger_1.ApiOperation)({ summary: '반영비율 조회' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "getRatio", null);
__decorate([
    (0, common_1.Put)('ratio/:U_ID/subjects'),
    (0, swagger_1.ApiOperation)({ summary: '과목별 비율 수정' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    (0, swagger_1.ApiBody)({ type: SubjectRatiosDto }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, SubjectRatiosDto]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "updateSubjectRatios", null);
__decorate([
    (0, common_1.Put)('ratio/:U_ID/english-scores'),
    (0, swagger_1.ApiOperation)({ summary: '영어 등급 배점 수정' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    (0, swagger_1.ApiBody)({ type: GradeScoresDto }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "updateEnglishScores", null);
__decorate([
    (0, common_1.Put)('ratio/:U_ID/history-scores'),
    (0, swagger_1.ApiOperation)({ summary: '한국사 등급 배점 수정' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    (0, swagger_1.ApiBody)({ type: GradeScoresDto }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "updateHistoryScores", null);
__decorate([
    (0, common_1.Put)('ratio/:U_ID/selection-rules'),
    (0, swagger_1.ApiOperation)({ summary: '선택반영 규칙 수정' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "updateSelectionRules", null);
__decorate([
    (0, common_1.Put)('ratio/:U_ID/special-formula'),
    (0, swagger_1.ApiOperation)({ summary: '특수공식 수정' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('formula')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "updateSpecialFormula", null);
__decorate([
    (0, common_1.Put)('ratio/:U_ID/bonus-rules'),
    (0, swagger_1.ApiOperation)({ summary: '가산점 규칙 수정' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "updateBonusRules", null);
__decorate([
    (0, common_1.Put)('ratio/:U_ID/score-config'),
    (0, swagger_1.ApiOperation)({ summary: '과목별 점수 종류 설정 수정' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "updateScoreConfig", null);
__decorate([
    (0, common_1.Put)('ratio/:U_ID/calc-method'),
    (0, swagger_1.ApiOperation)({ summary: '계산방식 수정' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "updateCalcMethod", null);
__decorate([
    (0, common_1.Put)('ratio/:U_ID/total'),
    (0, swagger_1.ApiOperation)({ summary: '총점 수정' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('total_score')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "updateTotalScore", null);
__decorate([
    (0, common_1.Put)('ratio/:U_ID/etc-settings'),
    (0, swagger_1.ApiOperation)({ summary: '기타 설정 수정' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "updateEtcSettings", null);
__decorate([
    (0, common_1.Put)('ratio/:U_ID/etc-note'),
    (0, swagger_1.ApiOperation)({ summary: '기타 노트 수정' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('note')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "updateEtcNote", null);
__decorate([
    (0, common_1.Put)('ratio/:U_ID/main-ratios'),
    (0, swagger_1.ApiOperation)({ summary: '수능/내신/실기 비율 수정' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "updateMainRatios", null);
__decorate([
    (0, common_1.Post)('bulk-update'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '여러 학과 정보 일괄 업데이트' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "bulkUpdate", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, swagger_1.ApiOperation)({ summary: '전체 데이터 내보내기 (JSON)' }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number }),
    __param(0, (0, common_1.Query)('year', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "exportAll", null);
__decorate([
    (0, common_1.Get)('highest-scores'),
    (0, swagger_1.ApiOperation)({ summary: '최고표점 목록 조회' }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number, description: '학년도' }),
    (0, swagger_1.ApiQuery)({ name: 'mohyung', type: String, description: '모형 (3월/6월/9월/수능)', required: false }),
    __param(0, (0, common_1.Query)('year', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('mohyung')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "getHighestScores", null);
__decorate([
    (0, common_1.Put)('highest-scores'),
    (0, swagger_1.ApiOperation)({ summary: '최고표점 일괄 수정' }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'mohyung', type: String, required: false }),
    (0, swagger_1.ApiBody)({ type: BulkHighestScoresDto }),
    __param(0, (0, common_1.Query)('year', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('mohyung')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, BulkHighestScoresDto]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "bulkUpdateHighestScores", null);
__decorate([
    (0, common_1.Get)('inquiry-conv/:U_ID'),
    (0, swagger_1.ApiOperation)({ summary: '변환표준점수 테이블 조회 (모의고사별)' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'exam_type', type: String, required: false, description: '3월모의고사/6월모평/9월모평/수능 (기본: 수능)' }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('year', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('exam_type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "getInquiryConv", null);
__decorate([
    (0, common_1.Put)('inquiry-conv/:U_ID'),
    (0, swagger_1.ApiOperation)({ summary: '변환표준점수 수정 (모의고사별)' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number }),
    (0, swagger_1.ApiBody)({ type: InquiryConvDto }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('year', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, InquiryConvDto]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "updateInquiryConv", null);
__decorate([
    (0, common_1.Post)('inquiry-conv/:U_ID/copy'),
    (0, swagger_1.ApiOperation)({ summary: '변환표 복사 (수능 → 다른 모의고사)' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('year', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "copyInquiryConv", null);
__decorate([
    (0, common_1.Get)('inquiry-conv-list'),
    (0, swagger_1.ApiOperation)({ summary: '변환표 있는 학교 목록' }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number }),
    __param(0, (0, common_1.Query)('year', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "getUniversitiesWithInquiryConv", null);
__decorate([
    (0, common_1.Get)('inquiry-conv-export'),
    (0, swagger_1.ApiOperation)({ summary: '변환표 엑셀 내보내기' }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'uid', type: Number, required: false }),
    __param(0, (0, common_1.Query)('year', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('uid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "getInquiryConvForExport", null);
__decorate([
    (0, common_1.Post)('inquiry-conv-import'),
    (0, swagger_1.ApiOperation)({ summary: '변환표 엑셀 업로드' }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number }),
    __param(0, (0, common_1.Query)('year', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "bulkImportInquiryConv", null);
__decorate([
    (0, common_1.Get)('practical/:U_ID'),
    (0, swagger_1.ApiOperation)({ summary: '실기 배점 조회' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('year', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "getPracticalScores", null);
__decorate([
    (0, common_1.Post)('practical/:U_ID'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: '실기 배점 추가' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number }),
    (0, swagger_1.ApiBody)({ type: PracticalScoreDto }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('year', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, PracticalScoreDto]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "addPracticalScore", null);
__decorate([
    (0, common_1.Put)('practical/item/:id'),
    (0, swagger_1.ApiOperation)({ summary: '실기 배점 수정' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "updatePracticalScore", null);
__decorate([
    (0, common_1.Delete)('practical/item/:id'),
    (0, swagger_1.ApiOperation)({ summary: '실기 배점 삭제' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "deletePracticalScore", null);
__decorate([
    (0, common_1.Get)('details/:U_ID'),
    (0, swagger_1.ApiOperation)({ summary: '학과 전체 상세 정보 조회' }),
    (0, swagger_1.ApiParam)({ name: 'U_ID', type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number }),
    __param(0, (0, common_1.Param)('U_ID', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('year', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "getFullDetails", null);
__decorate([
    (0, common_1.Post)('copy-year'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '연도 데이터 복사 (신년도 생성용)' }),
    (0, swagger_1.ApiBody)({ type: CopyYearDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CopyYearDto]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "copyYearData", null);
__decorate([
    (0, common_1.Get)('active-year'),
    (0, swagger_1.ApiOperation)({ summary: '활성 연도 조회' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "getActiveYear", null);
__decorate([
    (0, common_1.Put)('active-year'),
    (0, swagger_1.ApiOperation)({ summary: '활성 연도 설정' }),
    __param(0, (0, common_1.Body)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], JungsiAdminController.prototype, "setActiveYear", null);
exports.JungsiAdminController = JungsiAdminController = __decorate([
    (0, swagger_1.ApiTags)('jungsi-admin'),
    (0, common_1.Controller)('admin/jungsi'),
    __metadata("design:paramtypes", [jungsi_admin_service_1.JungsiAdminService])
], JungsiAdminController);
//# sourceMappingURL=jungsi-admin.controller.js.map