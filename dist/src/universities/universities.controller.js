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
const universities_service_1 = require("./universities.service");
let UniversitiesController = class UniversitiesController {
    universitiesService;
    constructor(universitiesService) {
        this.universitiesService = universitiesService;
    }
    async findAll(yearId) {
        const parsedYearId = yearId ? parseInt(yearId, 10) : undefined;
        return this.universitiesService.findAll(parsedYearId);
    }
    async count(yearId) {
        const parsedYearId = yearId ? parseInt(yearId, 10) : undefined;
        const [universities, departments] = await Promise.all([
            this.universitiesService.countUniversities(),
            this.universitiesService.countDepartments(parsedYearId),
        ]);
        return { universities, departments };
    }
    async findDepartments(yearId, univId, mojipgun, region) {
        return this.universitiesService.findDepartments({
            yearId: yearId ? parseInt(yearId, 10) : undefined,
            univId: univId ? parseInt(univId, 10) : undefined,
            mojipgun,
            region,
        });
    }
    async findDepartmentById(id) {
        const department = await this.universitiesService.findDepartmentById(id);
        if (!department) {
            throw new common_1.NotFoundException(`Department with ID ${id} not found`);
        }
        return department;
    }
    async findOne(id) {
        const university = await this.universitiesService.findOne(id);
        if (!university) {
            throw new common_1.NotFoundException(`University with ID ${id} not found`);
        }
        return university;
    }
};
exports.UniversitiesController = UniversitiesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('yearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UniversitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('count'),
    __param(0, (0, common_1.Query)('yearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UniversitiesController.prototype, "count", null);
__decorate([
    (0, common_1.Get)('departments'),
    __param(0, (0, common_1.Query)('yearId')),
    __param(1, (0, common_1.Query)('univId')),
    __param(2, (0, common_1.Query)('mojipgun')),
    __param(3, (0, common_1.Query)('region')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], UniversitiesController.prototype, "findDepartments", null);
__decorate([
    (0, common_1.Get)('departments/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UniversitiesController.prototype, "findDepartmentById", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UniversitiesController.prototype, "findOne", null);
exports.UniversitiesController = UniversitiesController = __decorate([
    (0, common_1.Controller)('universities'),
    __metadata("design:paramtypes", [universities_service_1.UniversitiesService])
], UniversitiesController);
//# sourceMappingURL=universities.controller.js.map