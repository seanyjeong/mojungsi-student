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
exports.UniversitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UniversitiesService = class UniversitiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(yearId) {
        const universities = await this.prisma.universities.findMany({
            include: {
                departments: {
                    where: yearId ? { year_id: yearId } : undefined,
                    include: {
                        formula_configs: true,
                    },
                },
            },
            orderBy: { univ_name: 'asc' },
        });
        const ratios = await this.prisma.jungsi_ratio.findMany({
            where: yearId ? { year: yearId } : undefined,
        });
        const ratioMap = new Map(ratios.map(r => [r.U_ID, r]));
        const displays = await this.prisma.subject_ratios_display.findMany({
            where: yearId ? { year: yearId } : undefined,
        });
        const displayMap = new Map(displays.map(d => [d.matched_uid, d]));
        const practicals = await this.prisma.jungsi_practical_scores.findMany({
            where: yearId ? { year: yearId } : undefined,
            distinct: ['U_ID', 'event_name'],
            select: { U_ID: true, event_name: true },
        });
        const practicalMap = new Map();
        practicals.forEach(p => {
            const events = practicalMap.get(p.U_ID) || [];
            events.push(p.event_name);
            practicalMap.set(p.U_ID, events);
        });
        const basicData = await this.prisma.jungsi_basic.findMany({
            where: yearId ? { year: yearId } : undefined,
            select: { U_ID: true, region: true, quota: true },
        });
        const regionMap = new Map(basicData.map(b => [b.U_ID, b.region]));
        const quotaMap = new Map(basicData.map(b => [b.U_ID, b.quota]));
        return universities.map(univ => {
            const isWomensUniv = univ.univ_name.includes('여자대학교');
            const firstDept = univ.departments[0];
            const firstLegacyUid = firstDept?.formula_configs?.legacy_uid || 0;
            const region = regionMap.get(firstLegacyUid) || univ.region || '미정';
            return {
                ...univ,
                region,
                isWomensUniv,
                departments: univ.departments.map(dept => {
                    const fc = dept.formula_configs;
                    const legacyUid = fc?.legacy_uid || 0;
                    const ratio = ratioMap.get(legacyUid);
                    const display = displayMap.get(legacyUid);
                    const events = practicalMap.get(legacyUid) || [];
                    const deptRegion = regionMap.get(legacyUid) || region;
                    const quota = quotaMap.get(legacyUid);
                    return {
                        ...dept,
                        region: deptRegion,
                        quota: quota || null,
                        jungsi_ratio: ratio ? {
                            suneung: ratio.suneung,
                            naesin: ratio.naesin,
                            silgi: ratio.practical,
                            silgi_total: ratio.practical_total,
                        } : null,
                        subject_display: display ? {
                            korean: display.korean_raw,
                            math: display.math_raw,
                            english: display.english_raw,
                            inquiry: display.inquiry_raw,
                            history: display.history_raw,
                            inquiry_count: display.inquiry_count,
                        } : null,
                        practical_events: events,
                    };
                }),
            };
        });
    }
    async findOne(univId) {
        return this.prisma.universities.findUnique({
            where: { univ_id: univId },
            include: {
                departments: {
                    include: {
                        formula_configs: true,
                        english_grade_tables: true,
                        history_grade_tables: true,
                        inquiry_conv_tables: true,
                    },
                },
            },
        });
    }
    async findDepartments(options) {
        const where = {};
        if (options?.yearId) {
            where.year_id = options.yearId;
        }
        if (options?.univId) {
            where.univ_id = options.univId;
        }
        if (options?.mojipgun) {
            where.mojipgun = options.mojipgun;
        }
        if (options?.region) {
            where.universities = { region: options.region };
        }
        return this.prisma.departments.findMany({
            where,
            include: {
                universities: true,
                formula_configs: true,
            },
            orderBy: [
                { universities: { univ_name: 'asc' } },
                { dept_name: 'asc' },
            ],
        });
    }
    async findDepartmentById(deptId) {
        return this.prisma.departments.findUnique({
            where: { dept_id: deptId },
            include: {
                universities: true,
                formula_configs: true,
                english_grade_tables: { orderBy: { grade: 'asc' } },
                history_grade_tables: { orderBy: { grade: 'asc' } },
                inquiry_conv_tables: { orderBy: { percentile: 'desc' } },
                practical_score_tables: true,
                practical_calc_rules: true,
            },
        });
    }
    async countUniversities() {
        return this.prisma.universities.count();
    }
    async countDepartments(yearId) {
        return this.prisma.departments.count({
            where: yearId ? { year_id: yearId } : undefined,
        });
    }
};
exports.UniversitiesService = UniversitiesService;
exports.UniversitiesService = UniversitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UniversitiesService);
//# sourceMappingURL=universities.service.js.map