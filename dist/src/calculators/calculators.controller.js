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
exports.CalculatorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const calculators_service_1 = require("./calculators.service");
class SubjectScoreDto {
    subject;
    std;
    pct;
    grade;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubjectScoreDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SubjectScoreDto.prototype, "std", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SubjectScoreDto.prototype, "pct", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SubjectScoreDto.prototype, "grade", void 0);
class GradeOnlyDto {
    grade;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GradeOnlyDto.prototype, "grade", void 0);
class FrontendScoresDto {
    korean;
    math;
    english;
    history;
    inquiry1;
    inquiry2;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SubjectScoreDto),
    __metadata("design:type", SubjectScoreDto)
], FrontendScoresDto.prototype, "korean", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SubjectScoreDto),
    __metadata("design:type", SubjectScoreDto)
], FrontendScoresDto.prototype, "math", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GradeOnlyDto),
    __metadata("design:type", GradeOnlyDto)
], FrontendScoresDto.prototype, "english", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GradeOnlyDto),
    __metadata("design:type", GradeOnlyDto)
], FrontendScoresDto.prototype, "history", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SubjectScoreDto),
    __metadata("design:type", SubjectScoreDto)
], FrontendScoresDto.prototype, "inquiry1", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SubjectScoreDto),
    __metadata("design:type", SubjectScoreDto)
], FrontendScoresDto.prototype, "inquiry2", void 0);
class CalculateSingleRequestDto {
    U_ID;
    year;
    scores;
    basis_exam;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalculateSingleRequestDto.prototype, "U_ID", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalculateSingleRequestDto.prototype, "year", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FrontendScoresDto),
    __metadata("design:type", FrontendScoresDto)
], CalculateSingleRequestDto.prototype, "scores", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculateSingleRequestDto.prototype, "basis_exam", void 0);
class CalculateBatchRequestDto {
    U_IDs;
    year;
    scores;
}
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CalculateBatchRequestDto.prototype, "U_IDs", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalculateBatchRequestDto.prototype, "year", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FrontendScoresDto),
    __metadata("design:type", FrontendScoresDto)
], CalculateBatchRequestDto.prototype, "scores", void 0);
class CalculateAllRequestDto {
    year;
    scores;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalculateAllRequestDto.prototype, "year", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FrontendScoresDto),
    __metadata("design:type", FrontendScoresDto)
], CalculateAllRequestDto.prototype, "scores", void 0);
let CalculatorsController = class CalculatorsController {
    calculatorsService;
    constructor(calculatorsService) {
        this.calculatorsService = calculatorsService;
    }
    async calculateSingle(dto) {
        try {
            const studentScores = this.transformFrontendScores(dto.scores);
            const response = await this.calculatorsService.calculateScore({
                U_ID: dto.U_ID,
                year: dto.year,
                studentScores,
                basis_exam: dto.basis_exam,
            });
            return {
                success: true,
                universityName: response.universityName,
                departmentName: response.departmentName,
                result: response.result,
            };
        }
        catch (error) {
            if (error.message?.includes('찾을 수 없습니다')) {
                throw new common_1.NotFoundException(error.message);
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    async calculateBatch(dto) {
        if (!dto.U_IDs || dto.U_IDs.length === 0) {
            throw new common_1.BadRequestException('U_IDs must not be empty');
        }
        if (dto.U_IDs.length > 100) {
            throw new common_1.BadRequestException('U_IDs must not exceed 100 items');
        }
        const studentScores = this.transformFrontendScores(dto.scores);
        const results = await this.calculatorsService.calculateBatch(dto.U_IDs, dto.year, studentScores);
        return {
            success: true,
            results,
            successCount: results.length,
            totalCount: dto.U_IDs.length,
        };
    }
    async calculateAll(dto) {
        const studentScores = this.transformFrontendScores(dto.scores);
        const results = await this.calculatorsService.calculateAll(dto.year, studentScores);
        return {
            success: true,
            results,
            count: results.length,
        };
    }
    async getUniversityList(year) {
        if (!year) {
            throw new common_1.BadRequestException('year 파라미터가 필요합니다.');
        }
        const list = await this.calculatorsService.getUniversityList(parseInt(year, 10));
        return {
            success: true,
            list,
        };
    }
    async getFormulaDetails(U_ID, year) {
        if (!U_ID || !year) {
            throw new common_1.BadRequestException('U_ID, year 파라미터가 필요합니다.');
        }
        try {
            const formula = await this.calculatorsService.getFormulaDetails(parseInt(U_ID, 10), parseInt(year, 10));
            return {
                success: true,
                formula,
            };
        }
        catch (error) {
            throw new common_1.NotFoundException(error.message);
        }
    }
    transformFrontendScores(scores) {
        const subjects = [];
        subjects.push({
            name: '국어',
            subject: scores.korean?.subject || '국어',
            std: scores.korean?.std || 0,
            percentile: scores.korean?.pct || 0,
            grade: scores.korean?.grade || 0,
        });
        subjects.push({
            name: '수학',
            subject: scores.math?.subject || '수학',
            std: scores.math?.std || 0,
            percentile: scores.math?.pct || 0,
            grade: scores.math?.grade || 0,
        });
        subjects.push({
            name: '영어',
            grade: scores.english?.grade || 5,
        });
        subjects.push({
            name: '한국사',
            grade: scores.history?.grade || 4,
        });
        if (scores.inquiry1) {
            subjects.push({
                name: '탐구',
                subject: scores.inquiry1.subject || '',
                std: scores.inquiry1.std || 0,
                percentile: scores.inquiry1.pct || 0,
                grade: scores.inquiry1.grade || 0,
            });
        }
        if (scores.inquiry2) {
            subjects.push({
                name: '탐구',
                subject: scores.inquiry2.subject || '',
                std: scores.inquiry2.std || 0,
                percentile: scores.inquiry2.pct || 0,
                grade: scores.inquiry2.grade || 0,
            });
        }
        return { subjects };
    }
};
exports.CalculatorsController = CalculatorsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '단일 학과 환산점수 계산',
        description: '학생 성적과 U_ID를 입력받아 해당 대학의 환산점수를 계산합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '계산 성공' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '잘못된 요청' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '학과를 찾을 수 없음' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CalculateSingleRequestDto]),
    __metadata("design:returntype", Promise)
], CalculatorsController.prototype, "calculateSingle", null);
__decorate([
    (0, common_1.Post)('batch'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '여러 학과 환산점수 일괄 계산',
        description: '학생 성적과 여러 U_ID를 입력받아 각 대학의 환산점수를 일괄 계산합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '계산 성공' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '잘못된 요청' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CalculateBatchRequestDto]),
    __metadata("design:returntype", Promise)
], CalculatorsController.prototype, "calculateBatch", null);
__decorate([
    (0, common_1.Post)('all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '전체 대학 환산점수 계산',
        description: '학생 성적과 학년도를 입력받아 해당 학년도의 모든 대학 환산점수를 계산합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '계산 성공' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '잘못된 요청' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CalculateAllRequestDto]),
    __metadata("design:returntype", Promise)
], CalculatorsController.prototype, "calculateAll", null);
__decorate([
    (0, common_1.Get)('university-list'),
    (0, swagger_1.ApiOperation)({
        summary: '대학/학과 목록 조회',
        description: '특정 학년도의 대학/학과 목록을 조회합니다.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number, description: '학년도' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '조회 성공' }),
    __param(0, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CalculatorsController.prototype, "getUniversityList", null);
__decorate([
    (0, common_1.Get)('formula-details'),
    (0, swagger_1.ApiOperation)({
        summary: '학과 상세 요강 조회',
        description: '특정 학과의 상세 반영비율 정보를 조회합니다.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'U_ID', type: Number, description: '대학 고유 ID' }),
    (0, swagger_1.ApiQuery)({ name: 'year', type: Number, description: '학년도' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '조회 성공' }),
    __param(0, (0, common_1.Query)('U_ID')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CalculatorsController.prototype, "getFormulaDetails", null);
exports.CalculatorsController = CalculatorsController = __decorate([
    (0, swagger_1.ApiTags)('calculators'),
    (0, common_1.Controller)('calculate'),
    __metadata("design:paramtypes", [calculators_service_1.CalculatorsService])
], CalculatorsController);
//# sourceMappingURL=calculators.controller.js.map