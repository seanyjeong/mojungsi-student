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
exports.FormulaConfigsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const formula_configs_service_1 = require("./formula-configs.service");
const create_formula_config_dto_1 = require("./dto/create-formula-config.dto");
const update_formula_config_dto_1 = require("./dto/update-formula-config.dto");
let FormulaConfigsController = class FormulaConfigsController {
    formulaConfigsService;
    constructor(formulaConfigsService) {
        this.formulaConfigsService = formulaConfigsService;
    }
    create(createFormulaConfigDto) {
        return this.formulaConfigsService.create(createFormulaConfigDto);
    }
    findAll(yearId, univId, recruit_group, search) {
        return this.formulaConfigsService.findAll({
            yearId: yearId ? parseInt(yearId, 10) : undefined,
            univId: univId ? parseInt(univId, 10) : undefined,
            recruit_group,
            search,
        });
    }
    findByDeptId(deptId) {
        return this.formulaConfigsService.findByDeptId(deptId);
    }
    findOne(id) {
        return this.formulaConfigsService.findOne(id);
    }
    update(id, updateFormulaConfigDto) {
        return this.formulaConfigsService.update(id, updateFormulaConfigDto);
    }
    remove(id) {
        return this.formulaConfigsService.remove(id);
    }
    copyToNewYear(fromYearId, toYearId) {
        return this.formulaConfigsService.copyToNewYear(fromYearId, toYearId);
    }
};
exports.FormulaConfigsController = FormulaConfigsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'formula_config 생성' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_formula_config_dto_1.CreateFormulaConfigDto]),
    __metadata("design:returntype", void 0)
], FormulaConfigsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'formula_config 목록 조회' }),
    (0, swagger_1.ApiQuery)({ name: 'yearId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'univId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'recruit_group', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    __param(0, (0, common_1.Query)('yearId')),
    __param(1, (0, common_1.Query)('univId')),
    __param(2, (0, common_1.Query)('recruit_group')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], FormulaConfigsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-dept/:deptId'),
    (0, swagger_1.ApiOperation)({ summary: 'dept_id로 formula_config 조회' }),
    __param(0, (0, common_1.Param)('deptId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FormulaConfigsController.prototype, "findByDeptId", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '단일 formula_config 조회' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FormulaConfigsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'formula_config 수정' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_formula_config_dto_1.UpdateFormulaConfigDto]),
    __metadata("design:returntype", void 0)
], FormulaConfigsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'formula_config 삭제' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FormulaConfigsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('copy-year'),
    (0, swagger_1.ApiOperation)({ summary: '연도별 데이터 복사 (예: 26학년도 → 27학년도)' }),
    __param(0, (0, common_1.Body)('fromYearId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('toYearId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], FormulaConfigsController.prototype, "copyToNewYear", null);
exports.FormulaConfigsController = FormulaConfigsController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Formula Configs'),
    (0, common_1.Controller)('admin/formula-configs'),
    __metadata("design:paramtypes", [formula_configs_service_1.FormulaConfigsService])
], FormulaConfigsController);
//# sourceMappingURL=formula-configs.controller.js.map