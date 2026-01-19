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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculateBatchResponseDto = exports.CalculateSingleResponseDto = exports.CalculationResultDto = exports.CalculationBreakdownDto = exports.CalculateAllRequestDto = exports.FrontendScoresDto = exports.FrontendGradeOnlyDto = exports.FrontendScoreItemDto = exports.CalculateBatchRequestDto = exports.CalculateSingleRequestDto = exports.StudentScoreDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class StudentScoreDto {
    koreanSubject;
    koreanStd;
    koreanPercentile;
    koreanGrade;
    mathSubject;
    mathStd;
    mathPercentile;
    mathGrade;
    englishGrade;
    historyGrade;
    inquiry1Subject;
    inquiry1Std;
    inquiry1Percentile;
    inquiry1Grade;
    inquiry2Subject;
    inquiry2Std;
    inquiry2Percentile;
    inquiry2Grade;
}
exports.StudentScoreDto = StudentScoreDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '국어 선택과목', example: '화법과작문' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StudentScoreDto.prototype, "koreanSubject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '국어 표준점수', example: 131 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], StudentScoreDto.prototype, "koreanStd", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '국어 백분위', example: 92 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], StudentScoreDto.prototype, "koreanPercentile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '국어 등급', example: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(9),
    __metadata("design:type", Number)
], StudentScoreDto.prototype, "koreanGrade", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '수학 선택과목', example: '미적분' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StudentScoreDto.prototype, "mathSubject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '수학 표준점수', example: 140 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], StudentScoreDto.prototype, "mathStd", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '수학 백분위', example: 95 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], StudentScoreDto.prototype, "mathPercentile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '수학 등급', example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(9),
    __metadata("design:type", Number)
], StudentScoreDto.prototype, "mathGrade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '영어 등급', example: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(9),
    __metadata("design:type", Number)
], StudentScoreDto.prototype, "englishGrade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '한국사 등급', example: 3 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(9),
    __metadata("design:type", Number)
], StudentScoreDto.prototype, "historyGrade", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '탐구1 선택과목', example: '생명과학1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StudentScoreDto.prototype, "inquiry1Subject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '탐구1 표준점수', example: 68 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], StudentScoreDto.prototype, "inquiry1Std", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '탐구1 백분위', example: 90 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], StudentScoreDto.prototype, "inquiry1Percentile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '탐구1 등급', example: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(9),
    __metadata("design:type", Number)
], StudentScoreDto.prototype, "inquiry1Grade", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '탐구2 선택과목', example: '화학1' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StudentScoreDto.prototype, "inquiry2Subject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '탐구2 표준점수', example: 65 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], StudentScoreDto.prototype, "inquiry2Std", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '탐구2 백분위', example: 85 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], StudentScoreDto.prototype, "inquiry2Percentile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '탐구2 등급', example: 2 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(9),
    __metadata("design:type", Number)
], StudentScoreDto.prototype, "inquiry2Grade", void 0);
class CalculateSingleRequestDto {
    deptId;
    student;
}
exports.CalculateSingleRequestDto = CalculateSingleRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '학과 ID', example: 214 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalculateSingleRequestDto.prototype, "deptId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '학생 성적', type: StudentScoreDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => StudentScoreDto),
    __metadata("design:type", StudentScoreDto)
], CalculateSingleRequestDto.prototype, "student", void 0);
class CalculateBatchRequestDto {
    deptIds;
    student;
}
exports.CalculateBatchRequestDto = CalculateBatchRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '학과 ID 목록', example: [214, 215, 216] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CalculateBatchRequestDto.prototype, "deptIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '학생 성적', type: StudentScoreDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => StudentScoreDto),
    __metadata("design:type", StudentScoreDto)
], CalculateBatchRequestDto.prototype, "student", void 0);
class FrontendScoreItemDto {
    subject;
    std;
    pct;
    grade;
}
exports.FrontendScoreItemDto = FrontendScoreItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FrontendScoreItemDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FrontendScoreItemDto.prototype, "std", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FrontendScoreItemDto.prototype, "pct", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FrontendScoreItemDto.prototype, "grade", void 0);
class FrontendGradeOnlyDto {
    grade;
}
exports.FrontendGradeOnlyDto = FrontendGradeOnlyDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(9),
    __metadata("design:type", Number)
], FrontendGradeOnlyDto.prototype, "grade", void 0);
class FrontendScoresDto {
    korean;
    math;
    english;
    history;
    inquiry1;
    inquiry2;
}
exports.FrontendScoresDto = FrontendScoresDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: FrontendScoreItemDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FrontendScoreItemDto),
    __metadata("design:type", FrontendScoreItemDto)
], FrontendScoresDto.prototype, "korean", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: FrontendScoreItemDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FrontendScoreItemDto),
    __metadata("design:type", FrontendScoreItemDto)
], FrontendScoresDto.prototype, "math", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: FrontendGradeOnlyDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FrontendGradeOnlyDto),
    __metadata("design:type", FrontendGradeOnlyDto)
], FrontendScoresDto.prototype, "english", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: FrontendGradeOnlyDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FrontendGradeOnlyDto),
    __metadata("design:type", FrontendGradeOnlyDto)
], FrontendScoresDto.prototype, "history", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: FrontendScoreItemDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FrontendScoreItemDto),
    __metadata("design:type", FrontendScoreItemDto)
], FrontendScoresDto.prototype, "inquiry1", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: FrontendScoreItemDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FrontendScoreItemDto),
    __metadata("design:type", FrontendScoreItemDto)
], FrontendScoresDto.prototype, "inquiry2", void 0);
class CalculateAllRequestDto {
    year;
    scores;
}
exports.CalculateAllRequestDto = CalculateAllRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '학년도', example: 2026 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalculateAllRequestDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '학생 성적 (프론트엔드 형식)', type: FrontendScoresDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FrontendScoresDto),
    __metadata("design:type", FrontendScoresDto)
], CalculateAllRequestDto.prototype, "scores", void 0);
class CalculationBreakdownDto {
    baseScore;
    selectScore;
    englishBonus;
    historyBonus;
    suneungRatio;
    rawTotal;
}
exports.CalculationBreakdownDto = CalculationBreakdownDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '기본 점수' }),
    __metadata("design:type", Number)
], CalculationBreakdownDto.prototype, "baseScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '선택 점수' }),
    __metadata("design:type", Number)
], CalculationBreakdownDto.prototype, "selectScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '영어 가산점' }),
    __metadata("design:type", Number)
], CalculationBreakdownDto.prototype, "englishBonus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '한국사 가산점' }),
    __metadata("design:type", Number)
], CalculationBreakdownDto.prototype, "historyBonus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '수능 반영 비율' }),
    __metadata("design:type", Number)
], CalculationBreakdownDto.prototype, "suneungRatio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '원점수 합계' }),
    __metadata("design:type", Number)
], CalculationBreakdownDto.prototype, "rawTotal", void 0);
class CalculationResultDto {
    finalScore;
    breakdown;
    debug;
}
exports.CalculationResultDto = CalculationResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '최종 환산점수' }),
    __metadata("design:type", Number)
], CalculationResultDto.prototype, "finalScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '세부 점수', type: CalculationBreakdownDto }),
    __metadata("design:type", CalculationBreakdownDto)
], CalculationResultDto.prototype, "breakdown", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '디버그 정보' }),
    __metadata("design:type", Object)
], CalculationResultDto.prototype, "debug", void 0);
class CalculateSingleResponseDto {
    universityName;
    departmentName;
    result;
}
exports.CalculateSingleResponseDto = CalculateSingleResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '대학명', example: '고려대학교' }),
    __metadata("design:type", String)
], CalculateSingleResponseDto.prototype, "universityName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '학과명', example: '국제스포츠학부' }),
    __metadata("design:type", String)
], CalculateSingleResponseDto.prototype, "departmentName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '계산 결과', type: CalculationResultDto }),
    __metadata("design:type", CalculationResultDto)
], CalculateSingleResponseDto.prototype, "result", void 0);
class CalculateBatchResponseDto {
    results;
    successCount;
    totalCount;
}
exports.CalculateBatchResponseDto = CalculateBatchResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '계산 결과 목록',
        type: [CalculateSingleResponseDto],
    }),
    __metadata("design:type", Array)
], CalculateBatchResponseDto.prototype, "results", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '성공 개수' }),
    __metadata("design:type", Number)
], CalculateBatchResponseDto.prototype, "successCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '총 요청 개수' }),
    __metadata("design:type", Number)
], CalculateBatchResponseDto.prototype, "totalCount", void 0);
//# sourceMappingURL=calculate.dto.js.map