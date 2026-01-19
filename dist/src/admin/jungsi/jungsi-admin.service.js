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
exports.JungsiAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let JungsiAdminService = class JungsiAdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBasicList(year) {
        const list = await this.prisma.jungsi_basic.findMany({
            where: { year },
            orderBy: [{ univ_name: 'asc' }, { dept_name: 'asc' }],
        });
        return list.map((item) => ({
            U_ID: item.U_ID,
            대학명: item.univ_name,
            학과명: item.dept_name,
            군: item.gun,
            형태: item.type,
            광역: item.region,
            시구: item.city,
            모집정원: item.quota,
            교직: item.teacher_cert,
            단계별: item.step_type,
            updated_at: item.updated_at,
        }));
    }
    async getBasicById(U_ID) {
        const basic = await this.prisma.jungsi_basic.findUnique({
            where: { U_ID },
        });
        if (!basic) {
            throw new common_1.NotFoundException(`U_ID ${U_ID} 학과를 찾을 수 없습니다.`);
        }
        return basic;
    }
    async updateBasic(U_ID, data) {
        return this.prisma.jungsi_basic.update({
            where: { U_ID },
            data,
        });
    }
    async getRatio(U_ID) {
        const ratio = await this.prisma.jungsi_ratio.findUnique({
            where: { U_ID },
        });
        if (!ratio) {
            throw new common_1.NotFoundException(`U_ID ${U_ID} 반영비율을 찾을 수 없습니다.`);
        }
        return {
            U_ID: ratio.U_ID,
            학년도: ratio.year,
            총점: ratio.total_score,
            수능비율: ratio.suneung,
            내신비율: ratio.naesin,
            실기비율: ratio.practical,
            실기총점: ratio.practical_total,
            국어: Number(ratio.korean || 0),
            수학: Number(ratio.math || 0),
            영어: Number(ratio.english || 0),
            탐구: Number(ratio.inquiry || 0),
            탐구수: ratio.inquiry_count || 2,
            영어등급배점: ratio.english_scores || {},
            한국사등급배점: ratio.history_scores || {},
            선택반영규칙: ratio.selection_rules || [],
            가산점규칙: ratio.bonus_rules || [],
            특수공식: ratio.special_formula || null,
            score_config: ratio.score_config || {},
            calc_type: ratio.calc_type || '기본비율',
            calc_method: ratio.calc_method || null,
            updated_at: ratio.updated_at,
        };
    }
    async updateSubjectRatios(U_ID, data) {
        return this.prisma.jungsi_ratio.update({
            where: { U_ID },
            data: {
                korean: data.국어?.toString(),
                math: data.수학?.toString(),
                english: data.영어?.toString(),
                inquiry: data.탐구?.toString(),
                inquiry_count: data.탐구수,
            },
        });
    }
    async updateEnglishScores(U_ID, scores) {
        for (let i = 1; i <= 9; i++) {
            if (scores[String(i)] === undefined) {
                throw new common_1.BadRequestException(`${i}등급 점수가 없습니다.`);
            }
        }
        return this.prisma.jungsi_ratio.update({
            where: { U_ID },
            data: { english_scores: scores },
        });
    }
    async updateHistoryScores(U_ID, scores) {
        for (let i = 1; i <= 9; i++) {
            if (scores[String(i)] === undefined) {
                throw new common_1.BadRequestException(`${i}등급 점수가 없습니다.`);
            }
        }
        return this.prisma.jungsi_ratio.update({
            where: { U_ID },
            data: { history_scores: scores },
        });
    }
    async updateSelectionRules(U_ID, rules) {
        for (const rule of rules) {
            if (!rule.type) {
                throw new common_1.BadRequestException('선택반영 규칙에 type이 필요합니다.');
            }
            if (rule.type === 'select_n') {
                if (!rule.from || !Array.isArray(rule.from)) {
                    throw new common_1.BadRequestException('select_n 규칙에 from 배열이 필요합니다.');
                }
                if (!rule.count || rule.count < 1) {
                    throw new common_1.BadRequestException('select_n 규칙에 count가 필요합니다.');
                }
            }
        }
        return this.prisma.jungsi_ratio.update({
            where: { U_ID },
            data: { selection_rules: rules },
        });
    }
    async updateSpecialFormula(U_ID, formula) {
        return this.prisma.jungsi_ratio.update({
            where: { U_ID },
            data: { special_formula: formula },
        });
    }
    async updateBonusRules(U_ID, rules) {
        return this.prisma.jungsi_ratio.update({
            where: { U_ID },
            data: { bonus_rules: rules },
        });
    }
    async updateScoreConfig(U_ID, config) {
        return this.prisma.jungsi_ratio.update({
            where: { U_ID },
            data: { score_config: config },
        });
    }
    async updateCalcMethod(U_ID, data) {
        return this.prisma.jungsi_ratio.update({
            where: { U_ID },
            data,
        });
    }
    async updateTotalScore(U_ID, totalScore) {
        return this.prisma.jungsi_ratio.update({
            where: { U_ID },
            data: { total_score: totalScore },
        });
    }
    async updateEtcSettings(U_ID, settings) {
        return this.prisma.jungsi_ratio.update({
            where: { U_ID },
            data: { etc_settings: settings },
        });
    }
    async updateEtcNote(U_ID, note) {
        return this.prisma.jungsi_ratio.update({
            where: { U_ID },
            data: { etc: note },
        });
    }
    async updateMainRatios(U_ID, data) {
        const updateData = {};
        if (data.suneung !== undefined)
            updateData.suneung = data.suneung ? parseInt(data.suneung) : null;
        if (data.naesin !== undefined)
            updateData.naesin = data.naesin ? parseInt(data.naesin) : null;
        if (data.practical !== undefined)
            updateData.practical = data.practical ? parseInt(data.practical) : null;
        if (data.practical_total !== undefined)
            updateData.practical_total = data.practical_total;
        return this.prisma.jungsi_ratio.update({
            where: { U_ID },
            data: updateData,
        });
    }
    async getHighestScores(year, exam_type = '수능') {
        const scores = await this.prisma.jungsi_highest_scores.findMany({
            where: { year, exam_type },
            orderBy: { subject_name: 'asc' },
        });
        return scores.map((s) => ({
            id: s.id,
            과목명: s.subject_name,
            최고점: Number(s.max_score),
        }));
    }
    async updateHighestScore(year, exam_type, subject_name, maxScore) {
        const existing = await this.prisma.jungsi_highest_scores.findFirst({
            where: { year, exam_type, subject_name },
        });
        if (existing) {
            return this.prisma.jungsi_highest_scores.update({
                where: { id: existing.id },
                data: { max_score: maxScore, updated_at: new Date() },
            });
        }
        else {
            return this.prisma.jungsi_highest_scores.create({
                data: { year, exam_type, subject_name, max_score: maxScore },
            });
        }
    }
    async bulkUpdateHighestScores(year, exam_type, scores) {
        const results = [];
        for (const score of scores) {
            const result = await this.updateHighestScore(year, exam_type, score.subject_name, score.max_score);
            results.push(result);
        }
        return results;
    }
    async getInquiryConv(U_ID, year, exam_type = '수능') {
        const convs = await this.prisma.jungsi_inquiry_conv.findMany({
            where: { U_ID, year, exam_type },
            orderBy: [{ track: 'asc' }, { percentile: 'desc' }],
        });
        const 사탐 = {};
        const 과탐 = {};
        for (const c of convs) {
            const target = c.track === '사탐' ? 사탐 : 과탐;
            target[c.percentile] = Number(c.converted_std_score);
        }
        return { U_ID, year, exam_type, 사탐, 과탐 };
    }
    // 특정 모의고사 변환표 존재 여부 확인
    async getAvailableExamTypes(U_ID, year) {
        const result = await this.prisma.jungsi_inquiry_conv.groupBy({
            by: ['exam_type'],
            where: { U_ID, year },
        });
        return result.map(r => r.exam_type);
    }
    async updateInquiryConv(U_ID, year, exam_type, track, scores) {
        await this.prisma.jungsi_inquiry_conv.deleteMany({
            where: { U_ID, year, exam_type, track },
        });
        const data = Object.entries(scores).map(([pct, conv]) => ({
            U_ID,
            year,
            exam_type,
            track,
            percentile: Number(pct),
            converted_std_score: conv,
        }));
        return this.prisma.jungsi_inquiry_conv.createMany({ data });
    }
    // 수능 → 다른 모의고사로 변환표 복사
    async copyInquiryConv(U_ID, year, fromExamType, toExamType) {
        const existing = await this.prisma.jungsi_inquiry_conv.findMany({
            where: { U_ID, year, exam_type: fromExamType },
        });
        if (existing.length === 0) {
            throw new Error(`복사할 변환표가 없습니다: ${fromExamType}`);
        }
        // 대상 삭제 후 복사
        await this.prisma.jungsi_inquiry_conv.deleteMany({
            where: { U_ID, year, exam_type: toExamType },
        });
        const data = existing.map(r => ({
            U_ID: r.U_ID,
            year: r.year,
            exam_type: toExamType,
            track: r.track,
            percentile: r.percentile,
            converted_std_score: r.converted_std_score,
        }));
        return this.prisma.jungsi_inquiry_conv.createMany({ data });
    }
    async getPracticalScores(U_ID, year) {
        const scores = await this.prisma.jungsi_practical_scores.findMany({
            where: { U_ID, year },
            orderBy: [{ event_name: 'asc' }, { gender: 'asc' }, { record: 'asc' }],
        });
        const grouped = {};
        for (const s of scores) {
            if (!grouped[s.event_name]) {
                grouped[s.event_name] = [];
            }
            grouped[s.event_name].push({
                id: s.id,
                성별: s.gender,
                기록: s.record,
                배점: Number(s.score),
            });
        }
        return grouped;
    }
    async addPracticalScore(U_ID, year, data) {
        return this.prisma.jungsi_practical_scores.create({
            data: {
                U_ID,
                year,
                event_name: data.event_name,
                gender: data.gender,
                record: data.record,
                score: data.score,
            },
        });
    }
    async updatePracticalScore(id, data) {
        return this.prisma.jungsi_practical_scores.update({
            where: { id },
            data,
        });
    }
    async deletePracticalScore(id) {
        return this.prisma.jungsi_practical_scores.delete({
            where: { id },
        });
    }
    async getFullDetails(U_ID, year) {
        const basic = await this.getBasicById(U_ID);
        const ratio = await this.getRatio(U_ID);
        const conv = await this.getInquiryConv(U_ID, year);
        const practical = await this.getPracticalScores(U_ID, year);
        return {
            기본정보: {
                U_ID: basic.U_ID,
                대학명: basic.univ_name,
                학과명: basic.dept_name,
                군: basic.gun,
                형태: basic.type,
                모집정원: basic.quota,
            },
            반영비율: ratio,
            변환표준점수: conv,
            실기배점: practical,
        };
    }
    async copyYearData(fromYear, toYear) {
        const basics = await this.prisma.jungsi_basic.findMany({
            where: { year: fromYear },
        });
        const maxUid = await this.prisma.jungsi_basic.aggregate({
            _max: { U_ID: true },
        });
        let newUid = (maxUid._max.U_ID || 0) + 1;
        const uidMap = {};
        for (const b of basics) {
            uidMap[b.U_ID] = newUid;
            await this.prisma.jungsi_basic.create({
                data: {
                    U_ID: newUid++,
                    year: toYear,
                    gun: b.gun,
                    type: b.type,
                    region: b.region,
                    city: b.city,
                    admission: b.admission,
                    univ_name: b.univ_name,
                    dept_name: b.dept_name,
                    quota: b.quota,
                    logo_url: b.logo_url,
                    teacher_cert: b.teacher_cert,
                    step_type: b.step_type,
                },
            });
        }
        const ratios = await this.prisma.jungsi_ratio.findMany({
            where: { year: fromYear },
        });
        for (const r of ratios) {
            if (!uidMap[r.U_ID])
                continue;
            await this.prisma.jungsi_ratio.create({
                data: {
                    year: toYear,
                    U_ID: uidMap[r.U_ID],
                    calc_method: r.calc_method,
                    total_score: r.total_score,
                    calc_type: r.calc_type,
                    apply_method: r.apply_method,
                    suneung: r.suneung,
                    naesin: r.naesin,
                    practical: r.practical,
                    practical_total: r.practical_total,
                    has_selection: r.has_selection,
                    selection_condition: r.selection_condition,
                    selection_weights: r.selection_weights,
                    history_method: r.history_method,
                    history_scores_text: r.history_scores_text,
                    base_score: r.base_score,
                    fail_handling: r.fail_handling,
                    etc: r.etc,
                    korean: r.korean,
                    math: r.math,
                    english: r.english,
                    inquiry: r.inquiry,
                    inquiry_count: r.inquiry_count,
                    history: r.history,
                    english_scores: r.english_scores ?? undefined,
                    history_scores: r.history_scores ?? undefined,
                    selection_rules: r.selection_rules ?? undefined,
                    special_formula: r.special_formula,
                    etc_settings: r.etc_settings ?? undefined,
                    bonus_rules: r.bonus_rules ?? undefined,
                    score_config: r.score_config ?? undefined,
                    practical_mode: r.practical_mode,
                    practical_special: r.practical_special ?? undefined,
                },
            });
        }
        const convs = await this.prisma.jungsi_inquiry_conv.findMany({
            where: { year: fromYear },
        });
        for (const c of convs) {
            if (!uidMap[c.U_ID])
                continue;
            await this.prisma.jungsi_inquiry_conv.create({
                data: {
                    U_ID: uidMap[c.U_ID],
                    year: toYear,
                    track: c.track,
                    percentile: c.percentile,
                    converted_std_score: c.converted_std_score,
                },
            });
        }
        const practicals = await this.prisma.jungsi_practical_scores.findMany({
            where: { year: fromYear },
        });
        for (const p of practicals) {
            if (!uidMap[p.U_ID])
                continue;
            await this.prisma.jungsi_practical_scores.create({
                data: {
                    U_ID: uidMap[p.U_ID],
                    year: toYear,
                    event_name: p.event_name,
                    gender: p.gender,
                    record: p.record,
                    score: p.score,
                },
            });
        }
        return {
            message: `${fromYear}년도 데이터를 ${toYear}년도로 복사했습니다.`,
            copiedCount: {
                basic: Object.keys(uidMap).length,
                ratio: ratios.length,
                conv: convs.length,
                practical: practicals.length,
            },
            uidMap,
        };
    }
    async bulkUpdate(year, data) {
        let updated = 0;
        let failed = 0;
        const errors = [];
        for (const item of data) {
            try {
                const basicUpdate = {};
                if (item.univ_name !== undefined)
                    basicUpdate.univ_name = item.univ_name;
                if (item.dept_name !== undefined)
                    basicUpdate.dept_name = item.dept_name;
                if (item.gun !== undefined)
                    basicUpdate.gun = item.gun;
                if (item.quota !== undefined)
                    basicUpdate.quota = item.quota;
                if (Object.keys(basicUpdate).length > 0) {
                    await this.prisma.jungsi_basic.update({
                        where: { U_ID: item.U_ID },
                        data: basicUpdate,
                    });
                }
                const ratioUpdate = {};
                if (item.suneung !== undefined)
                    ratioUpdate.suneung = item.suneung;
                if (item.naesin !== undefined)
                    ratioUpdate.naesin = item.naesin;
                if (item.practical !== undefined)
                    ratioUpdate.practical = item.practical;
                if (item.korean !== undefined)
                    ratioUpdate.korean = String(item.korean);
                if (item.math !== undefined)
                    ratioUpdate.math = String(item.math);
                if (item.english !== undefined)
                    ratioUpdate.english = String(item.english);
                if (item.inquiry !== undefined)
                    ratioUpdate.inquiry = String(item.inquiry);
                if (item.inquiry_count !== undefined)
                    ratioUpdate.inquiry_count = item.inquiry_count;
                if (item.english_scores !== undefined)
                    ratioUpdate.english_scores = item.english_scores;
                if (item.history_scores !== undefined)
                    ratioUpdate.history_scores = item.history_scores;
                if (Object.keys(ratioUpdate).length > 0) {
                    await this.prisma.jungsi_ratio.update({
                        where: { U_ID: item.U_ID },
                        data: ratioUpdate,
                    });
                }
                updated++;
            }
            catch (e) {
                failed++;
                errors.push(`U_ID ${item.U_ID}: ${e.message?.substring(0, 50)}`);
            }
        }
        return { updated, failed, errors: errors.slice(0, 10) };
    }
    async exportAll(year) {
        const basics = await this.prisma.jungsi_basic.findMany({
            where: { year },
            orderBy: [{ univ_name: 'asc' }, { dept_name: 'asc' }],
        });
        const ratios = await this.prisma.jungsi_ratio.findMany({
            where: { year },
        });
        const ratioMap = {};
        for (const r of ratios) {
            ratioMap[r.U_ID] = r;
        }
        return basics.map((b) => {
            const r = ratioMap[b.U_ID] || {};
            return {
                U_ID: b.U_ID,
                대학명: b.univ_name,
                학과명: b.dept_name,
                군: b.gun,
                형태: b.type,
                모집정원: b.quota,
                수능비율: r.suneung || '',
                내신비율: r.naesin || '',
                실기비율: r.practical || '',
                총점: r.total_score || 0,
                국어: Number(r.korean || 0),
                수학: Number(r.math || 0),
                영어: Number(r.english || 0),
                탐구: Number(r.inquiry || 0),
                탐구수: r.inquiry_count || 2,
                영1: r.english_scores?.[1] ?? '',
                영2: r.english_scores?.[2] ?? '',
                영3: r.english_scores?.[3] ?? '',
                영4: r.english_scores?.[4] ?? '',
                영5: r.english_scores?.[5] ?? '',
                영6: r.english_scores?.[6] ?? '',
                영7: r.english_scores?.[7] ?? '',
                영8: r.english_scores?.[8] ?? '',
                영9: r.english_scores?.[9] ?? '',
                한1: r.history_scores?.[1] ?? '',
                한2: r.history_scores?.[2] ?? '',
                한3: r.history_scores?.[3] ?? '',
                한4: r.history_scores?.[4] ?? '',
                한5: r.history_scores?.[5] ?? '',
                한6: r.history_scores?.[6] ?? '',
                한7: r.history_scores?.[7] ?? '',
                한8: r.history_scores?.[8] ?? '',
                한9: r.history_scores?.[9] ?? '',
            };
        });
    }
    // 활성 연도 조회
    async getActiveYear() {
        const result = await this.prisma.$queryRaw`SELECT setting_value FROM system_settings WHERE setting_key = 'active_year'`;
        if (result && result.length > 0) {
            return parseInt(result[0].setting_value, 10);
        }
        return 2026; // 기본값
    }
    // 활성 연도 설정
    async setActiveYear(year) {
        await this.prisma.$executeRaw`UPDATE system_settings SET setting_value = ${String(year)} WHERE setting_key = 'active_year'`;
        return { success: true, activeYear: year };
    }
    // 변환표가 있는 학교 목록 조회
    async getUniversitiesWithInquiryConv(year) {
        const result = await this.prisma.$queryRaw`
            SELECT DISTINCT c.U_ID, b.대학명, b.학과명, b.군,
                   COUNT(CASE WHEN c.계열 = '사탐' THEN 1 END) as 사탐_count,
                   COUNT(CASE WHEN c.계열 = '과탐' THEN 1 END) as 과탐_count
            FROM jungsi_inquiry_conv c
            JOIN jungsi_basic b ON c.U_ID = b.U_ID
            WHERE c.학년도 = ${year}
            GROUP BY c.U_ID, b.대학명, b.학과명, b.군
            ORDER BY b.대학명, b.학과명
        `;
        // BigInt를 Number로 변환
        return result.map(r => ({
            ...r,
            U_ID: Number(r.U_ID),
            사탐_count: Number(r.사탐_count),
            과탐_count: Number(r.과탐_count)
        }));
    }
    // 엑셀 내보내기용 데이터 조회
    async getInquiryConvForExport(year, uid) {
        let query;
        if (uid) {
            query = await this.prisma.$queryRaw`
                SELECT c.U_ID, b.대학명, b.학과명, c.계열, c.백분위, c.변환표준점수
                FROM jungsi_inquiry_conv c
                JOIN jungsi_basic b ON c.U_ID = b.U_ID
                WHERE c.학년도 = ${year} AND c.U_ID = ${uid}
                ORDER BY c.U_ID, c.계열, c.백분위 DESC
            `;
        } else {
            query = await this.prisma.$queryRaw`
                SELECT c.U_ID, b.대학명, b.학과명, c.계열, c.백분위, c.변환표준점수
                FROM jungsi_inquiry_conv c
                JOIN jungsi_basic b ON c.U_ID = b.U_ID
                WHERE c.학년도 = ${year}
                ORDER BY c.U_ID, c.계열, c.백분위 DESC
            `;
        }
        // BigInt/Decimal 변환
        return query.map(r => ({
            ...r,
            U_ID: Number(r.U_ID),
            백분위: Number(r.백분위),
            변환표준점수: Number(r.변환표준점수)
        }));
    }
    // 엑셀 업로드 - 일괄 입력
    async bulkImportInquiryConv(year, data) {
        // data: Array<{ U_ID, 계열, 백분위, 변환표준점수 }>
        const results = { inserted: 0, updated: 0, errors: [] };

        for (const row of data) {
            try {
                // 기존 데이터 확인
                const existing = await this.prisma.$queryRaw`
                    SELECT id FROM jungsi_inquiry_conv
                    WHERE U_ID = ${row.U_ID} AND 학년도 = ${year} AND 계열 = ${row.계열} AND 백분위 = ${row.백분위}
                `;

                if (existing && existing.length > 0) {
                    // 업데이트
                    await this.prisma.$executeRaw`
                        UPDATE jungsi_inquiry_conv
                        SET 변환표준점수 = ${row.변환표준점수}, updated_at = NOW()
                        WHERE id = ${existing[0].id}
                    `;
                    results.updated++;
                } else {
                    // 신규 삽입
                    await this.prisma.$executeRaw`
                        INSERT INTO jungsi_inquiry_conv (U_ID, 학년도, 계열, 백분위, 변환표준점수)
                        VALUES (${row.U_ID}, ${year}, ${row.계열}, ${row.백분위}, ${row.변환표준점수})
                    `;
                    results.inserted++;
                }
            } catch (err) {
                results.errors.push({ row, error: err.message });
            }
        }

        return results;
    }
};
exports.JungsiAdminService = JungsiAdminService;
exports.JungsiAdminService = JungsiAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JungsiAdminService);
//# sourceMappingURL=jungsi-admin.service.js.map