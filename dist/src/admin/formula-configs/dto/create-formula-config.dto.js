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
exports.CreateFormulaConfigDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateFormulaConfigDto {
    deptId;
    totalScore;
    suneungRatio;
    silgiTotal;
    subjectsConfig;
    selectionRules;
    bonusRules;
    englishScores;
    historyScores;
    calculationMode;
    legacyFormula;
    legacyUid;
    displayConfig;
}
exports.CreateFormulaConfigDto = CreateFormulaConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '학과 ID' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFormulaConfigDto.prototype, "deptId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '총점', default: 1000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(2000),
    __metadata("design:type", Number)
], CreateFormulaConfigDto.prototype, "totalScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '수능 비율 (%)', default: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateFormulaConfigDto.prototype, "suneungRatio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '실기 만점', default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateFormulaConfigDto.prototype, "silgiTotal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '과목별 설정 (JSON)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateFormulaConfigDto.prototype, "subjectsConfig", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '선택반영 규칙 (JSON)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateFormulaConfigDto.prototype, "selectionRules", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '가산점 규칙 (JSON)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateFormulaConfigDto.prototype, "bonusRules", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '영어 등급 환산표 (JSON)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateFormulaConfigDto.prototype, "englishScores", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '한국사 등급 환산표 (JSON)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateFormulaConfigDto.prototype, "historyScores", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '계산 모드', default: 'legacy' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFormulaConfigDto.prototype, "calculationMode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '레거시 공식' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFormulaConfigDto.prototype, "legacyFormula", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '레거시 U_ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFormulaConfigDto.prototype, "legacyUid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '화면 표시용 설정 (JSON)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateFormulaConfigDto.prototype, "displayConfig", void 0);
//# sourceMappingURL=create-formula-config.dto.js.map