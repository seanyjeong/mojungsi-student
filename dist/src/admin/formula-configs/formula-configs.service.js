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
exports.FormulaConfigsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let FormulaConfigsService = class FormulaConfigsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(params) {
        const where = {};
        if (params?.yearId || params?.univId || params?.recruit_group || params?.search) {
            where.departments = {};
            if (params.yearId) {
                where.departments.year_id = params.yearId;
            }
            if (params.univId) {
                where.departments.univ_id = params.univId;
            }
            if (params.recruit_group) {
                where.departments.recruit_group = params.recruit_group;
            }
            if (params.search) {
                where.OR = [
                    { departments: { dept_name: { contains: params.search } } },
                    { departments: { universities: { univ_name: { contains: params.search } } } },
                ];
            }
        }
        return this.prisma.formula_configs.findMany({
            where,
            include: {
                departments: {
                    include: {
                        universities: true,
                    },
                },
            },
            orderBy: [
                { departments: { universities: { univ_name: 'asc' } } },
                { departments: { dept_name: 'asc' } },
            ],
        });
    }
    async findOne(id) {
        const config = await this.prisma.formula_configs.findUnique({
            where: { config_id: id },
            include: {
                departments: {
                    include: {
                        universities: true,
                        english_grade_tables: true,
                        history_grade_tables: true,
                    },
                },
            },
        });
        if (!config) {
            throw new common_1.NotFoundException(`FormulaConfig with ID ${id} not found`);
        }
        return config;
    }
    async findByDeptId(deptId) {
        const config = await this.prisma.formula_configs.findUnique({
            where: { dept_id: deptId },
            include: {
                departments: {
                    include: {
                        universities: true,
                    },
                },
            },
        });
        if (!config) {
            throw new common_1.NotFoundException(`FormulaConfig for department ${deptId} not found`);
        }
        return config;
    }
    async create(dto) {
        return this.prisma.formula_configs.create({
            data: {
                dept_id: dto.deptId,
                total_score: dto.totalScore,
                suneung_ratio: dto.suneungRatio,
                practical_total: dto.silgiTotal,
                subjects_config: dto.subjectsConfig,
                selection_rules: dto.selectionRules,
                bonus_rules: dto.bonusRules,
                english_scores: dto.englishScores,
                history_scores: dto.historyScores,
                calculation_mode: dto.calculationMode || 'legacy',
                legacy_formula: dto.legacyFormula,
                legacy_uid: dto.legacyUid,
                display_config: dto.displayConfig,
            },
            include: {
                departments: {
                    include: {
                        universities: true,
                    },
                },
            },
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.formula_configs.update({
            where: { config_id: id },
            data: {
                total_score: dto.totalScore,
                suneung_ratio: dto.suneungRatio,
                practical_total: dto.silgiTotal,
                subjects_config: dto.subjectsConfig,
                selection_rules: dto.selectionRules,
                bonus_rules: dto.bonusRules,
                english_scores: dto.englishScores,
                history_scores: dto.historyScores,
                calculation_mode: dto.calculationMode,
                legacy_formula: dto.legacyFormula,
                display_config: dto.displayConfig,
            },
            include: {
                departments: {
                    include: {
                        universities: true,
                    },
                },
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.formula_configs.delete({
            where: { config_id: id },
        });
    }
    async copyToNewYear(fromYearId, toYearId) {
        const sourceDepts = await this.prisma.departments.findMany({
            where: { year_id: fromYearId },
            include: {
                formula_configs: true,
            },
        });
        const results = {
            copied: 0,
            skipped: 0,
            errors: [],
        };
        for (const dept of sourceDepts) {
            try {
                const existingDept = await this.prisma.departments.findFirst({
                    where: {
                        year_id: toYearId,
                        univ_id: dept.univ_id,
                        dept_name: dept.dept_name,
                        recruit_group: dept.recruit_group,
                    },
                });
                if (!existingDept) {
                    const newDept = await this.prisma.departments.create({
                        data: {
                            univ_id: dept.univ_id,
                            year_id: toYearId,
                            dept_name: dept.dept_name,
                            recruit_group: dept.recruit_group,
                            recruit_count: dept.recruit_count,
                            type: dept.type,
                            teacher_cert: dept.teacher_cert,
                            step_type: dept.step_type,
                        },
                    });
                    if (dept.formula_configs) {
                        const fc = dept.formula_configs;
                        await this.prisma.formula_configs.create({
                            data: {
                                dept_id: newDept.dept_id,
                                total_score: fc.total_score,
                                suneung_ratio: fc.suneung_ratio,
                                practical_total: fc.practical_total,
                                subjects_config: fc.subjects_config ?? client_1.Prisma.JsonNull,
                                selection_rules: fc.selection_rules ?? client_1.Prisma.JsonNull,
                                bonus_rules: fc.bonus_rules ?? client_1.Prisma.JsonNull,
                                english_scores: fc.english_scores ?? client_1.Prisma.JsonNull,
                                history_scores: fc.history_scores ?? client_1.Prisma.JsonNull,
                                calculation_mode: fc.calculation_mode,
                                legacy_formula: fc.legacy_formula,
                                display_config: fc.display_config ?? client_1.Prisma.JsonNull,
                            },
                        });
                    }
                    results.copied++;
                }
                else {
                    results.skipped++;
                }
            }
            catch (error) {
                results.errors.push(`${dept.dept_name}: ${error.message}`);
            }
        }
        return results;
    }
};
exports.FormulaConfigsService = FormulaConfigsService;
exports.FormulaConfigsService = FormulaConfigsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FormulaConfigsService);
//# sourceMappingURL=formula-configs.service.js.map