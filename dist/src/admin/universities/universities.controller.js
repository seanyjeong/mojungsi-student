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
exports.UniversitiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const universities_service_1 = require("./universities.service");
let UniversitiesController = class UniversitiesController {
    universitiesService;
    constructor(universitiesService) {
        this.universitiesService = universitiesService;
    }
    findAll(yearId, search) {
        return this.universitiesService.findAll({
            yearId: yearId ? parseInt(yearId, 10) : undefined,
            search,
        });
    }
    findDepartments(univId, yearId, recruit_group) {
        return this.universitiesService.findDepartments(univId, {
            yearId: yearId ? parseInt(yearId, 10) : undefined,
            recruit_group,
        });
    }
};
exports.UniversitiesController = UniversitiesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '대학 목록 조회' }),
    (0, swagger_1.ApiQuery)({ name: 'yearId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    __param(0, (0, common_1.Query)('yearId')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':univId/departments'),
    (0, swagger_1.ApiOperation)({ summary: '대학의 학과 목록 조회' }),
    (0, swagger_1.ApiQuery)({ name: 'yearId', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'recruit_group', required: false, type: String }),
    __param(0, (0, common_1.Param)('univId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('yearId')),
    __param(2, (0, common_1.Query)('recruit_group')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", void 0)
], UniversitiesController.prototype, "findDepartments", null);
exports.UniversitiesController = UniversitiesController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Universities'),
    (0, common_1.Controller)('admin/universities'),
    __metadata("design:paramtypes", [universities_service_1.UniversitiesService])
], UniversitiesController);
//# sourceMappingURL=universities.controller.js.map