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
exports.SavedUniversitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SavedUniversitiesService = class SavedUniversitiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSavedUniversities(userId) {
        const saved = await this.prisma.saas_saved_universities.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });
        const results = await Promise.all(saved.map(async (s) => {
            const univ = await this.prisma.jungsi_basic.findUnique({
                where: { U_ID: s.U_ID },
            });
            const ratio = await this.prisma.jungsi_ratio.findUnique({
                where: { U_ID: s.U_ID },
            });
            const practicalEvents = await this.prisma.jungsi_practical_scores.findMany({
                where: { U_ID: s.U_ID },
                distinct: ['event_name'],
                select: { event_name: true },
            });
            const eventNames = practicalEvents.map(p => p.event_name).join(', ');
            const isWomensUniv = univ?.univ_name?.includes('여자대학교') || false;
            const university = univ ? {
                U_NM: univ.univ_name,
                D_NM: univ.dept_name,
                지역: univ.region || '미정',
                모집인원: univ.quota ? parseInt(univ.quota) || 0 : 0,
                모집군: univ.gun ? `${univ.gun}군` : '',
                실기종목: eventNames,
                수능반영비율: ratio?.suneung || 0,
                내신반영비율: ratio?.naesin || 0,
                실기반영비율: ratio?.practical || 0,
                isWomensUniv,
            } : null;
            return {
                ...s,
                university,
            };
        }));
        return results;
    }
    async toggleSave(userId, uId, sunungScore) {
        const existing = await this.prisma.saas_saved_universities.findUnique({
            where: {
                user_id_U_ID: {
                    user_id: userId,
                    U_ID: uId,
                },
            },
        });
        if (existing) {
            await this.prisma.saas_saved_universities.delete({
                where: { id: existing.id },
            });
            return { saved: false };
        }
        else {
            await this.prisma.saas_saved_universities.create({
                data: {
                    user_id: userId,
                    U_ID: uId,
                    sunung_score: sunungScore,
                },
            });
            return { saved: true };
        }
    }
    async updateSavedUniversity(userId, uId, data) {
        return this.prisma.saas_saved_universities.update({
            where: {
                user_id_U_ID: {
                    user_id: userId,
                    U_ID: uId,
                },
            },
            data: {
                naesin_score: data.naesin_score,
                memo: data.memo,
                practical_score: data.practical_score,
                practical_records: data.practical_records
                    ? JSON.parse(JSON.stringify(data.practical_records))
                    : undefined,
                updated_at: new Date(),
            },
        });
    }
    async getPracticalScoreTable(uId, year, gender) {
        // 저장된 U_ID로 대학명/학과명 조회
        const savedUniv = await this.prisma.jungsi_basic.findUnique({
            where: { U_ID: uId },
        });

        // 해당 연도에서 같은 대학명+학과명의 U_ID 찾기
        let targetUId = uId;
        if (savedUniv) {
            const yearUniv = await this.prisma.jungsi_basic.findFirst({
                where: {
                    univ_name: savedUniv.univ_name,
                    dept_name: savedUniv.dept_name,
                    year: year,
                },
            });
            if (yearUniv) {
                targetUId = yearUniv.U_ID;
            }
        }

        const where = {
            U_ID: targetUId,
            year: year,
        };
        const scoreTable = await this.prisma.jungsi_practical_scores.findMany({
            where,
            orderBy: [
                { event_name: 'asc' },
                { score: 'desc' },
            ],
        });
        const filtered = scoreTable.filter(row => {
            if (!gender)
                return true;
            if (!row.gender || row.gender === '공통')
                return true;
            return row.gender === gender;
        });
        // 종목별 단위 조회
        const eventNames = [...new Set(filtered.map(r => r.event_name))];
        let unitMap = {};
        if (eventNames.length > 0) {
            try {
                const placeholders = eventNames.map(() => '?').join(',');
                const unitResults = await this.prisma.$queryRawUnsafe(
                    `SELECT event_name, unit, direction FROM practical_event_units WHERE event_name IN (${placeholders})`,
                    ...eventNames
                );
                for (const u of unitResults) {
                    unitMap[u.event_name] = { unit: u.unit, direction: u.direction };
                }
            } catch (e) {
                console.log('Unit query error:', e.message);
            }
        }

        const grouped = {};
        for (const row of filtered) {
            const eventName = row.event_name;
            if (!grouped[eventName]) {
                grouped[eventName] = [];
            }
            grouped[eventName].push({
                기록: row.record,
                배점: row.score ? Number(row.score) : 0,
                성별: row.gender,
            });
        }
        const ratio = await this.prisma.jungsi_ratio.findUnique({
            where: { U_ID: targetUId },
        });
        return {
            events: Object.keys(grouped),
            scoreTable: grouped,
            units: unitMap,
            practicalMode: ratio?.practical_mode || 'basic',
            practicalTotal: ratio?.practical_total || 0,
            baseScore: ratio?.base_score || 0,
            failHandling: ratio?.fail_handling || '0점',
            specialConfig: ratio?.practical_special || null,
        };
    }
    async isSaved(userId, uId) {
        const saved = await this.prisma.saas_saved_universities.findUnique({
            where: {
                user_id_U_ID: {
                    user_id: userId,
                    U_ID: uId,
                },
            },
        });
        return !!saved;
    }
};
exports.SavedUniversitiesService = SavedUniversitiesService;
exports.SavedUniversitiesService = SavedUniversitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SavedUniversitiesService);
//# sourceMappingURL=saved-universities.service.js.map