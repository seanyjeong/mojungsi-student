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
exports.helpers = exports.CalculatorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const safeParse = (v, fb = null) => {
    if (v == null)
        return fb;
    if (typeof v === 'object')
        return v;
    try {
        return JSON.parse(v);
    }
    catch {
        return fb;
    }
};
const pickByType = (row, type) => {
    if (!row)
        return 0;
    if (type === '표준점수' || type === '변환표준점수')
        return Number(row.std || 0);
    return Number(row.percentile || 0);
};
const kmSubjectNameForKorean = (row) => row?.subject || '국어';
const kmSubjectNameForMath = (row) => row?.subject || '수학';
const inquirySubjectName = (row) => row?.subject || '탐구';
const resolveTotal = (F) => {
    const t = Number(F?.총점);
    return (Number.isFinite(t) && t > 0) ? t : 1000;
};
function detectEnglishAsBonus(F) {
    if (isSubjectUsedInRules('영어', F?.selection_rules))
        return false;
    const kw = ['가산점', '가감점', '가점', '감점'];
    if (typeof F?.영어처리 === 'string' && kw.some(k => F.영어처리.includes(k)))
        return true;
    if (typeof F?.영어비고 === 'string' && kw.some(k => F.영어비고.includes(k)))
        return true;
    for (const [k, v] of Object.entries(F)) {
        if (typeof v !== 'string')
            continue;
        if (k.includes('영어') || k.includes('비고') || k.includes('설명') || k.includes('기타')) {
            if (v.includes('영어') && kw.some(t => v.includes(t)))
                return true;
        }
    }
    if ((Number(F?.영어 || 0) === 0) && F?.english_scores)
        return true;
    return false;
}
function isSubjectUsedInRules(name, rulesArr) {
    const rules = Array.isArray(rulesArr) ? rulesArr : (rulesArr ? [rulesArr] : []);
    for (const r of rules) {
        if (!r || !Array.isArray(r.from))
            continue;
        if (r.from.includes(name))
            return true;
    }
    return false;
}
function calcInquiryRepresentative(inquiryRows, type, inquiryCount) {
    const key = (type === '표준점수' || type === '변환표준점수') ? 'std' : 'percentile';
    const arr = (inquiryRows || [])
        .map((t) => ({ row: t, subject: inquirySubjectName(t), val: Number(t?.[key] || 0) }))
        .sort((a, b) => b.val - a.val);
    if (arr.length === 0)
        return { rep: 0, sorted: arr, picked: [] };
    const n = Math.max(1, inquiryCount || 1);
    const picked = arr.slice(0, Math.min(n, arr.length));
    const rep = picked.reduce((s, x) => s + x.val, 0) / picked.length;
    return { rep, sorted: arr, picked };
}
function resolveMaxScores(scoreConfig, englishScores, highestMap, S) {
    const kmType = scoreConfig?.korean_math?.type || '백분위';
    const inqType = scoreConfig?.inquiry?.type || '백분위';
    const kmMethod = scoreConfig?.korean_math?.max_score_method || '';
    const inqMethod = scoreConfig?.inquiry?.max_score_method || '';
    let korMax = (kmType === '표준점수' || kmMethod === 'fixed_200') ? 200 : 100;
    let mathMax = korMax;
    let inqMax = (inqType === '표준점수' || inqType === '변환표준점수' || inqMethod === 'fixed_100') ? 100 : 100;
    if (kmMethod === 'highest_of_year' && highestMap) {
        const korKey = kmSubjectNameForKorean(S?.국어);
        const mathKey = kmSubjectNameForMath(S?.수학);
        if (highestMap[korKey] != null)
            korMax = Number(highestMap[korKey]);
        if (highestMap[mathKey] != null)
            mathMax = Number(highestMap[mathKey]);
    }
    let engMax = 100;
    if (scoreConfig?.english?.type === 'fixed_max_score' && Number(scoreConfig?.english?.max_score)) {
        engMax = Number(scoreConfig.english.max_score);
    }
    else {
        if (englishScores && typeof englishScores === 'object') {
            const vals = Object.values(englishScores).map(Number).filter(n => !Number.isNaN(n));
            if (vals.length)
                engMax = Math.max(...vals);
        }
    }
    return { korMax, mathMax, engMax, inqMax };
}
function evaluateSpecialFormula(formulaText, ctx, log) {
    const replaced = String(formulaText || '').replace(/\{([a-z0-9_]+)\}/gi, (_, k) => {
        const v = Number(ctx[k] ?? 0);
        log.push(`[특수공식 변수] ${k} = ${isFinite(v) ? v : 0}`);
        return String(isFinite(v) ? v : 0);
    });
    if (!/^[0-9+\-*/().\s]+$/.test(replaced)) {
        throw new Error('특수공식에 허용되지 않은 토큰이 포함되어 있습니다.');
    }
    const val = Function(`"use strict"; return (${replaced});`)();
    return Number(val) || 0;
}
const readConvertedStd = (t) => Number(t?.converted_std ?? t?.vstd ?? t?.conv_std ?? t?.std ?? t?.percentile ?? 0);
function guessInquiryGroup(subjectName = '') {
    const s = String(subjectName);
    const sci = ['물리', '화학', '생명', '지구'];
    if (sci.some(w => s.includes(w)))
        return '과탐';
    return '사탐';
}
function mapPercentileToConverted(mapObj, pct) {
    const p = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
    if (!mapObj)
        return null;
    if (mapObj[String(p)] != null)
        return Number(mapObj[String(p)]);
    const keys = Object.keys(mapObj).map(k => parseInt(k, 10)).filter(n => !Number.isNaN(n)).sort((a, b) => a - b);
    if (!keys.length)
        return null;
    if (p <= keys[0])
        return Number(mapObj[String(keys[0])]);
    if (p >= keys[keys.length - 1])
        return Number(mapObj[String(keys[keys.length - 1])]);
    let lo = keys[0], hi = keys[keys.length - 1];
    for (let i = 1; i < keys.length; i++) {
        if (keys[i] >= p) {
            hi = keys[i];
            lo = keys[i - 1];
            break;
        }
    }
    const y1 = Number(mapObj[String(lo)]);
    const y2 = Number(mapObj[String(hi)]);
    const t = (p - lo) / (hi - lo);
    return y1 + (y2 - y1) * t;
}
function buildSpecialContext(F, S, highestMap) {
    const ctx = {};
    ctx.total = resolveTotal(F);
    ctx.suneung_ratio = (Number(F.수능) || 0) / 100;
    const cfg = safeParse(F.score_config, {}) || {};
    const kmMethod = cfg?.korean_math?.max_score_method || '';
    const korKey = kmSubjectNameForKorean(S?.국어);
    const mathKey = kmSubjectNameForMath(S?.수학);
    let korMax = 200;
    let mathMax = 200;
    if (kmMethod === 'fixed_200') {
        korMax = 200;
        mathMax = 200;
    }
    else if (kmMethod === 'highest_of_year') {
        if (highestMap && highestMap[korKey] != null)
            korMax = Number(highestMap[korKey]);
        if (highestMap && highestMap[mathKey] != null)
            mathMax = Number(highestMap[mathKey]);
    }
    if (highestMap) {
        if (highestMap[korKey] != null)
            korMax = Number(highestMap[korKey]);
        if (highestMap[mathKey] != null)
            mathMax = Number(highestMap[mathKey]);
    }
    if (!Number.isFinite(korMax) || korMax <= 0)
        korMax = 1;
    if (!Number.isFinite(mathMax) || mathMax <= 0)
        mathMax = 1;
    ctx.kor_max = korMax;
    ctx.math_max = mathMax;
    ctx.ratio_kor = Number(F['국어'] || 0);
    ctx.ratio_math = Number(F['수학'] || 0);
    ctx.ratio_inq = Number(F['탐구'] || 0);
    ctx.ratio_kor_norm = ctx.ratio_kor / 100;
    ctx.ratio_math_norm = ctx.ratio_math / 100;
    ctx.ratio_inq_norm = ctx.ratio_inq / 100;
    ctx.ratio5_kor = ctx.ratio_kor_norm * 5;
    ctx.ratio5_math = ctx.ratio_math_norm * 5;
    ctx.ratio5_inq = ctx.ratio_inq_norm * 5;
    ctx.kor_std = Number(S.국어?.std || 0);
    ctx.kor_pct = Number(S.국어?.percentile || 0);
    ctx.math_std = Number(S.수학?.std || 0);
    ctx.math_pct = Number(S.수학?.percentile || 0);
    ctx.eng_grade_score = 0;
    if (F.english_scores && S.영어?.grade != null) {
        const eg = String(S.영어.grade);
        ctx.eng_grade_score = Number(F.english_scores[eg] ?? 0);
        const vals = Object.values(F.english_scores).map(Number).filter(n => !Number.isNaN(n));
        const engMax = vals.length ? Math.max(...vals) : 100;
        ctx.eng_max = engMax;
        ctx.eng_pct_est = engMax > 0 ? Math.min(100, Math.max(0, (ctx.eng_grade_score / engMax) * 100)) : 0;
    }
    else {
        ctx.eng_pct_est = 0;
    }
    ctx.hist_grade_score = 0;
    if (F.history_scores && S.한국사?.grade != null) {
        const hg = String(S.한국사.grade);
        ctx.hist_grade_score = Number(F.history_scores[hg] || 0);
    }
    const inqs = (S.탐구 || []);
    const sortedConv = inqs.map((t) => ({ conv: readConvertedStd(t), std: Number(t?.std || 0), pct: Number(t?.percentile || 0) }))
        .sort((a, b) => b.conv - a.conv);
    const sortedStd = inqs.map((t) => ({ subject: t?.subject || '', std: Number(t?.std || 0), pct: Number(t?.percentile || 0) }))
        .sort((a, b) => b.std - a.std);
    const sortedPct = inqs.map((t) => ({ pct: Number(t?.percentile || 0) }))
        .sort((a, b) => b.pct - a.pct);
    ctx.inq1_converted_std = sortedConv[0]?.conv || 0;
    ctx.inq2_converted_std = sortedConv[1]?.conv || 0;
    ctx.inq_sum2_converted_std = ctx.inq1_converted_std + ctx.inq2_converted_std;
    ctx.inq_avg2_converted_std = (ctx.inq_sum2_converted_std) / (sortedConv.length >= 2 ? 2 : (sortedConv.length || 1));
    ctx.inq1_std = sortedStd[0]?.std || 0;
    ctx.inq2_std = sortedStd[1]?.std || 0;
    let inq1_max = 0;
    let inq2_max = 0;
    if (highestMap) {
        const inq1_subject = sortedStd[0]?.subject;
        const inq2_subject = sortedStd[1]?.subject;
        inq1_max = Number(highestMap[inq1_subject] || 0);
        inq2_max = Number(highestMap[inq2_subject] || 0);
    }
    const items_std_kme_inq1_doubled = [
        Number(ctx.kor_std || 0),
        Number(ctx.math_std || 0),
        Number(ctx.eng_grade_score || 0),
        (Number(ctx.inq1_std || 0) * 2.0)
    ].map(v => Math.max(0, v));
    items_std_kme_inq1_doubled.sort((a, b) => b - a);
    ctx.top3_sum_std_kme_inq1_doubled = (items_std_kme_inq1_doubled[0] || 0) +
        (items_std_kme_inq1_doubled[1] || 0) +
        (items_std_kme_inq1_doubled[2] || 0);
    const convTable = F.탐구변표;
    if (convTable && (Object.keys(convTable['사탐'] || {}).length > 0 || Object.keys(convTable['과탐'] || {}).length > 0)) {
        const inq1_subject = sortedStd[0]?.subject;
        const inq2_subject = sortedStd[1]?.subject;
        const inq1_group = guessInquiryGroup(inq1_subject || '');
        const inq2_group = guessInquiryGroup(inq2_subject || '');
        let maxConv_inq1 = 0;
        let maxConv_inq2 = 0;
        if (convTable[inq1_group]) {
            const vals = Object.values(convTable[inq1_group]).map(Number).filter(n => !isNaN(n));
            if (vals.length > 0)
                maxConv_inq1 = Math.max(...vals);
        }
        if (inq2_subject && convTable[inq2_group]) {
            const vals = Object.values(convTable[inq2_group]).map(Number).filter(n => !isNaN(n));
            if (vals.length > 0)
                maxConv_inq2 = Math.max(...vals);
        }
        else if (inq2_subject) {
            maxConv_inq2 = maxConv_inq1;
        }
        else {
            maxConv_inq2 = 0;
        }
        if (inq1_subject && inq2_subject && inq1_group === inq2_group) {
            maxConv_inq2 = maxConv_inq1;
        }
        if (maxConv_inq1 > 0)
            inq1_max = maxConv_inq1;
        if (maxConv_inq2 > 0)
            inq2_max = maxConv_inq2;
    }
    ctx.inq1_max_std = inq1_max;
    ctx.inq2_max_std = inq2_max;
    ctx.inq_sum2_std = ctx.inq1_std + ctx.inq2_std;
    ctx.inq_avg2_std = (ctx.inq_sum2_std) / (sortedStd.length >= 2 ? 2 : (sortedStd.length || 1));
    ctx.inq1_percentile = sortedPct[0]?.pct || 0;
    ctx.inq2_percentile = sortedPct[1]?.pct || 0;
    ctx.inq_sum2_percentile = ctx.inq1_percentile + ctx.inq2_percentile;
    ctx.inq_avg2_percentile = (ctx.inq_sum2_percentile) / (sortedPct.length >= 2 ? 2 : (sortedPct.length || 1));
    const kor_pct = ctx.kor_pct;
    const math_pct = ctx.math_pct;
    const inq1_pct = ctx.inq1_percentile;
    const eng_pct_est = ctx.eng_pct_est;
    const top3_no_eng = [kor_pct, math_pct, inq1_pct].sort((a, b) => b - a).slice(0, 3);
    ctx.top3_avg_pct_kor_math_inq1 = top3_no_eng.length ? (top3_no_eng.reduce((s, x) => s + x, 0) / top3_no_eng.length) : 0;
    const top3_with_eng = [kor_pct, math_pct, inq1_pct, eng_pct_est].sort((a, b) => b - a).slice(0, 3);
    ctx.top3_avg_pct_kor_eng_math_inq1 = top3_with_eng.length ? (top3_with_eng.reduce((s, x) => s + x, 0) / top3_with_eng.length) : 0;
    ctx.top3_avg_pct = ctx.top3_avg_pct_kor_eng_math_inq1;
    const mathSubject = S.수학?.subject_name || '';
    let mathBonus = 1.0;
    const bonusRules = safeParse(F.bonus_rules, []);
    if (Array.isArray(bonusRules)) {
        for (const rule of bonusRules) {
            if (rule && rule.type === 'percent_bonus' && Array.isArray(rule.subjects) && rule.subjects.includes(mathSubject)) {
                mathBonus = 1.0 + (Number(rule.value) || 0);
                break;
            }
        }
    }
    const ratio_eng_norm_local = (Number(F['영어'] || 0) / 100.0);
    const scaled_kor = (ctx.kor_pct || 0) * (ctx.ratio_kor_norm || 0);
    const scaled_math = (ctx.math_pct || 0) * (ctx.ratio_math_norm || 0);
    const scaled_eng = (ctx.eng_grade_score || 0) * ratio_eng_norm_local;
    const items_scaled_kme = [scaled_kor, scaled_math, scaled_eng];
    items_scaled_kme.sort((a, b) => b - a);
    ctx.top2_sum_scaled_kme = (items_scaled_kme[0] || 0) + (items_scaled_kme[1] || 0);
    const items_pct_kme_for_top2_avg = [
        Number(ctx.kor_pct || 0),
        Number(ctx.math_pct || 0),
        Number(ctx.eng_pct_est || 0)
    ].map(v => Math.max(0, Math.min(100, v)));
    items_pct_kme_for_top2_avg.sort((a, b) => b - a);
    const top2_sum = (items_pct_kme_for_top2_avg[0] || 0) +
        (items_pct_kme_for_top2_avg[1] || 0);
    ctx.top2_avg_pct_kme = top2_sum / 2.0;
    const items_pct_kme_inqAvg_for_top3_avg = [
        Number(ctx.kor_pct || 0),
        Number(ctx.math_pct || 0),
        Number(ctx.inq_avg2_percentile || 0),
        Number(ctx.eng_pct_est || 0)
    ].map(v => Math.max(0, Math.min(100, v)));
    items_pct_kme_inqAvg_for_top3_avg.sort((a, b) => b - a);
    const top3_sum = (items_pct_kme_inqAvg_for_top3_avg[0] || 0) +
        (items_pct_kme_inqAvg_for_top3_avg[1] || 0) +
        (items_pct_kme_inqAvg_for_top3_avg[2] || 0);
    ctx.top3_avg_pct_kme_inqAvg = top3_sum / 3.0;
    ctx.math_bonus_pct_10 = 0;
    if (/미적분|기하/.test(mathSubject)) {
        ctx.math_bonus_pct_10 = (ctx.math_pct || 0) * 0.1;
    }
    const items_pct_kme_inqAvg_with_mathBonus = [
        Number(ctx.kor_pct || 0),
        Number(ctx.math_pct || 0) + Number(ctx.math_bonus_pct_10 || 0),
        Number(ctx.inq_avg2_percentile || 0),
        Number(ctx.eng_grade_score || 0)
    ];
    items_pct_kme_inqAvg_with_mathBonus.sort((a, b) => b - a);
    const top3_sum_with_mathBonus = (items_pct_kme_inqAvg_with_mathBonus[0] || 0) +
        (items_pct_kme_inqAvg_with_mathBonus[1] || 0) +
        (items_pct_kme_inqAvg_with_mathBonus[2] || 0);
    ctx.top3_avg_pct_kme_inqAvg_mathBonus = top3_sum_with_mathBonus / 3.0;
    ctx.top1_math_or_eng_pct = Math.max(Number(ctx.math_pct || 0), Number(ctx.eng_pct_est || 0));
    const math_std_bonused = ctx.math_std * mathBonus;
    ctx.math_std_bonused = math_std_bonused;
    ctx.max_kor_math_std = Math.max(ctx.kor_std, math_std_bonused);
    let math_pct_bonused = ctx.math_pct * mathBonus;
    if (F.score_config?.math_bonus_cap_100 === true) {
        math_pct_bonused = Math.min(100, math_pct_bonused);
    }
    const items_pct_kme_inqAvg_for_120 = [
        Number(ctx.kor_pct || 0),
        Number(ctx.math_pct || 0),
        Number(ctx.inq_avg2_percentile || 0),
        Number(ctx.eng_pct_est || 0)
    ].map(v => Math.max(0, Math.min(100, v)));
    items_pct_kme_inqAvg_for_120.sort((a, b) => b - a);
    const top1_scaled = (items_pct_kme_inqAvg_for_120[0] || 0) * 0.6;
    const top2_scaled = (items_pct_kme_inqAvg_for_120[1] || 0) * 0.6;
    ctx.top2_sum_scaled60_kme_inqAvg = top1_scaled + top2_scaled;
    ctx.math_pct_bonused = math_pct_bonused;
    ctx.max_kor_math_pct = Math.max(ctx.kor_pct, math_pct_bonused);
    const items_pct_kmi_for_top2_both = [
        Number(ctx.kor_pct || 0),
        Number(ctx.math_pct || 0),
        Number(ctx.inq_avg2_percentile || 0)
    ].map(v => Math.max(0, Math.min(100, v)));
    items_pct_kmi_for_top2_both.sort((a, b) => b - a);
    const top1_val_40pct = (items_pct_kmi_for_top2_both[0] || 0) * 0.4;
    const top2_val_40pct = (items_pct_kmi_for_top2_both[1] || 0) * 0.4;
    const sum_80pct = top1_val_40pct + top2_val_40pct;
    ctx.top2_kmInq_scaled_80_x_6 = sum_80pct * 6;
    ctx.top2_kmInq_scaled_80_x_7 = sum_80pct * 7;
    const items_pct = [
        Number(ctx.kor_pct || 0),
        Number(ctx.math_pct || 0),
        Number(ctx.inq1_percentile || 0),
        Number(ctx.inq2_percentile || 0),
    ].map(v => Math.max(0, Math.min(100, v)));
    items_pct.sort((a, b) => b - a);
    ctx.top2_sum_norm_pct_kmi2 = ((items_pct[0] || 0) + (items_pct[1] || 0)) / 100;
    ctx.top2_sum_raw_pct_kmi2 = (items_pct[0] || 0) + (items_pct[1] || 0);
    (function attachSocialBoost() {
        const tuples = inqs.map((t) => ({
            subject: t.subject_name || '',
            group: t.group || t.type || guessInquiryGroup(t.subject_name || ''),
            conv: readConvertedStd(t)
        })).sort((a, b) => b.conv - a.conv);
        const inq1 = tuples[0];
        const inq2 = tuples[1];
        ctx.inq1_social_boost = (inq1 && inq1.group === '사탐') ? 1.05 : 1.0;
        ctx.inq2_social_boost = (inq2 && inq2.group === '사탐') ? 1.05 : 1.0;
    })();
    const kme_scores_for_top2 = [ctx.kor_pct, ctx.math_pct, ctx.eng_grade_score].sort((a, b) => b - a);
    ctx.top2_sum_raw_pct_kme = (kme_scores_for_top2[0] || 0) + (kme_scores_for_top2[1] || 0);
    return ctx;
}
function calculateScore(formulaDataRaw, studentScores, highestMap) {
    const log = [];
    log.push('========== 계산 시작 ==========');
    const F = { ...formulaDataRaw };
    F.selection_rules = safeParse(F.selection_rules, null);
    F.score_config = safeParse(F.score_config, {}) || {};
    F.english_scores = safeParse(F.english_scores, null);
    F.history_scores = safeParse(F.history_scores, null);
    F.english_bonus_scores = safeParse(F.english_bonus_scores, null);
    const englishBonusFixed = Number(F.english_bonus_fixed || 0);
    const otherSettings = safeParse(F.기타설정, {}) || {};
    const englishAsBonus = detectEnglishAsBonus(F);
    const subs = studentScores?.subjects || [];
    const S = {
        국어: subs.find((s) => s.name === '국어') || {},
        수학: subs.find((s) => s.name === '수학') || {},
        영어: subs.find((s) => s.name === '영어') || {},
        한국사: subs.find((s) => s.name === '한국사') || {},
        탐구: subs.filter((s) => s.name === '탐구')
    };
    if (F.U_ID === 148 || F.U_ID === 149 || F.U_ID === 1148 || F.U_ID === 1149) {
        log.push(`<< U_ID ${F.U_ID}번 대학 하드코딩 로직 실행 >>`);
        const gradeToScoreMap = { 1: 100, 2: 93, 3: 86, 4: 79, 5: 72, 6: 65, 7: 58, 8: 51, 9: 44 };
        const defaultScore = 0;
        const korGrade = S.국어?.grade || 9;
        const mathGrade = S.수학?.grade || 9;
        const engGrade = S.영어?.grade || 9;
        let bestInqGrade = 9;
        if (S.탐구 && S.탐구.length > 0) {
            const inquiryGrades = S.탐구.map((t) => t.grade || 9).sort((a, b) => a - b);
            bestInqGrade = inquiryGrades[0];
        }
        const korScore = gradeToScoreMap[korGrade] || defaultScore;
        const mathScore = gradeToScoreMap[mathGrade] || defaultScore;
        const engScore = gradeToScoreMap[engGrade] || defaultScore;
        const inqScore = gradeToScoreMap[bestInqGrade] || defaultScore;
        log.push(` -> 국:${korGrade}등급(${korScore}점), 수:${mathGrade}등급(${mathScore}점), 영:${engGrade}등급(${engScore}점), 탐(Best):${bestInqGrade}등급(${inqScore}점)`);
        const scoresToSelect = [korScore, mathScore, engScore, inqScore];
        scoresToSelect.sort((a, b) => b - a);
        const top2Sum = scoresToSelect[0] + scoresToSelect[1];
        log.push(` -> 상위 2개 영역 합: ${scoresToSelect[0]} + ${scoresToSelect[1]} = ${top2Sum}점`);
        let histScore = 0;
        const histGrade = S.한국사?.grade;
        if (histGrade && F.history_scores) {
            histScore = Number(F.history_scores[String(histGrade)] || 0);
            log.push(` -> 한국사: ${histGrade}등급 → ${histScore}점 (가산)`);
        }
        const finalScore = top2Sum + histScore;
        log.push(`========== 최종 ==========`);
        return {
            totalScore: finalScore.toFixed(2),
            breakdown: { top2: top2Sum, history: histScore },
            calculationLog: log
        };
    }
    if (F.U_ID === 76 || F.U_ID === 1076) {
        log.push(`<< U_ID ${F.U_ID}번 대학 (등급 평균) 하드코딩 로직 실행 >>`);
        const scoreTable = {
            1: 700.0, 2: 692.0, 3: 684.0, 4: 676.0,
            5: 668.0, 6: 660.0, 7: 652.0, 8: 644.0, 9: 630.0
        };
        const korGrade = S.국어?.grade || 9;
        const mathGrade = S.수학?.grade || 9;
        const engGrade = S.영어?.grade || 9;
        let bestInqGrade = 9;
        if (S.탐구 && S.탐구.length > 0) {
            const inqGrades = S.탐구.map((t) => t.grade || 9).sort((a, b) => a - b);
            bestInqGrade = inqGrades[0];
        }
        const gradeSum = korGrade + mathGrade + engGrade + bestInqGrade;
        const gradeAvg = gradeSum / 4.0;
        let uniGrade = Math.floor(gradeAvg);
        if (gradeAvg < 1.0)
            uniGrade = 1;
        if (gradeAvg >= 9.0)
            uniGrade = 9;
        uniGrade = Math.max(1, Math.min(9, uniGrade));
        const finalScore = scoreTable[uniGrade] || 630.0;
        log.push(`========== 최종 ==========`);
        return {
            totalScore: finalScore.toFixed(1),
            breakdown: { special: finalScore },
            calculationLog: log
        };
    }
    if (F.계산유형 === '특수공식' && F.특수공식) {
        log.push('<< 특수공식 모드 >>');
        const ctx = buildSpecialContext(F, S, highestMap);
        log.push(`[특수공식 원본] ${F.특수공식}`);
        const specialValue = evaluateSpecialFormula(F.특수공식, ctx, log);
        const final = Number(specialValue) || 0;
        log.push('========== 최종 ==========');
        log.push(`특수공식 결과 = ${final.toFixed(2)}`);
        return {
            totalScore: final.toFixed(2),
            breakdown: { special: final },
            calculationLog: log
        };
    }
    const cfg = F.score_config || {};
    const kmType = cfg.korean_math?.type || '백분위';
    const inqType = cfg.inquiry?.type || '백분위';
    const inqMethod = cfg.inquiry?.max_score_method || '';
    const inquiryCount = Math.max(1, parseInt(F.탐구수 || '1', 10));
    const { rep: inqRep } = calcInquiryRepresentative(S.탐구, inqType, inquiryCount);
    let engConv = 0;
    let englishGradeBonus = 0;
    if (F.english_scores && S.영어?.grade != null) {
        const g = String(S.영어.grade);
        if (englishAsBonus) {
            englishGradeBonus = Number(F.english_scores[g] ?? 0);
        }
        else {
            engConv = Number(F.english_scores[g] ?? 0);
        }
    }
    const rulesArray = Array.isArray(F.selection_rules)
        ? F.selection_rules
        : (F.selection_rules ? [F.selection_rules] : []);
    const historyAppearsInRules = isSubjectUsedInRules('한국사', rulesArray);
    const historyRatioPositive = Number(F['한국사'] || 0) > 0;
    const historyAsSubject = historyAppearsInRules || historyRatioPositive;
    let histConv = 0;
    if (historyAsSubject && F.history_scores && S.한국사?.grade != null) {
        const hg = String(S.한국사.grade);
        histConv = Number(F.history_scores[hg] ?? 0);
    }
    const raw = {
        국어: pickByType(S.국어, kmType),
        수학: pickByType(S.수학, kmType),
        영어: englishAsBonus ? 0 : engConv,
        한국사: historyAsSubject ? histConv : 0,
        탐구: inqRep
    };
    if (englishAsBonus) {
        log.push(`[원점수] 국:${raw.국어} / 수:${raw.수학} / 영(가산점모드-과목반영X):0 / 탐(대표):${raw.탐구}`);
    }
    else {
        log.push(`[원점수] 국:${raw.국어} / 수:${raw.수학} / 영(환산):${raw.영어} / 탐(대표):${raw.탐구}`);
    }
    if (historyAsSubject) {
        log.push(`[원점수] 한국사(과목반영): ${raw.한국사}`);
    }
    const { korMax, mathMax, engMax, inqMax } = resolveMaxScores(cfg, F.english_scores, highestMap, S);
    let histMax = 100;
    if (F.history_scores && typeof F.history_scores === 'object') {
        const vals = Object.values(F.history_scores).map(Number).filter(n => !Number.isNaN(n));
        if (vals.length)
            histMax = Math.max(...vals);
    }
    const getMax = (name) => {
        if (name === '국어')
            return korMax;
        if (name === '수학')
            return mathMax;
        if (name === '영어')
            return engMax;
        if (name === '탐구')
            return inqMax;
        if (name === '한국사')
            return histMax;
        return 100;
    };
    const normOf = (name) => {
        if (name === '한국사' && historyAsSubject) {
            const sc = Number(raw[name] || 0);
            log.push(`[정규화 조정] 한국사(과목 반영) 점수 ${sc}를 100점 만점 기준으로 정규화`);
            return 100 > 0 ? Math.max(0, Math.min(1, sc / 100)) : 0;
        }
        if (name === '탐구' && inqMethod === 'highest_of_year') {
            const allInquiryNormalized = S.탐구.map((sub) => {
                const subject = sub.subject || '';
                let val = 0;
                let top = 0;
                let normalized = 0;
                if (inqType === '변환표준점수') {
                    if (!F.탐구변표)
                        return null;
                    const group = sub.group || sub.type || guessInquiryGroup(subject);
                    const convTableForGroup = F.탐구변표[group];
                    if (!convTableForGroup || Object.keys(convTableForGroup).length === 0)
                        return null;
                    const maxConvScore = Math.max(...Object.values(convTableForGroup).map(Number).filter(n => !isNaN(n)));
                    val = readConvertedStd(sub);
                    top = maxConvScore;
                }
                else if (inqType === '표준점수') {
                    if (!highestMap)
                        return null;
                    val = Number(sub.std || 0);
                    top = Number(highestMap[subject] ?? NaN);
                }
                else {
                    return null;
                }
                if (!Number.isFinite(top) || top <= 0 || !Number.isFinite(val))
                    return null;
                normalized = Math.max(0, Math.min(1, val / top));
                return { subject, val, top, normalized };
            }).filter((r) => r != null);
            allInquiryNormalized.sort((a, b) => b.normalized - a.normalized);
            const n = Math.max(1, inquiryCount || 1);
            const pickedNormalized = allInquiryNormalized.slice(0, Math.min(n, allInquiryNormalized.length));
            if (pickedNormalized.length) {
                const avg = pickedNormalized.reduce((s, r) => s + r.normalized, 0) / pickedNormalized.length;
                log.push(`[탐구정규화-정렬] highest_of_year (Top${n}): ${pickedNormalized.map((p) => `${p.subject}:${p.normalized.toFixed(4)} [${p.val}/${p.top}]`).join(', ')} → 평균비율=${avg.toFixed(4)}`);
                return avg;
            }
            log.push(`[탐구정규화-정렬] FAILED.`);
            return 0;
        }
        const sc = Number(raw[name] || 0);
        const mx = getMax(name);
        return mx > 0 ? Math.max(0, Math.min(1, sc / mx)) : 0;
    };
    const TOTAL = resolveTotal(F);
    const suneungRatio = (Number(F.수능) || 0) / 100;
    log.push(`[학교] 총점=${TOTAL}, 수능비율=${suneungRatio} (DB총점 반영)`);
    const rules = rulesArray;
    const selectWeightSubjects = new Set();
    const selectWeightSum = rules.reduce((acc, r) => {
        if (r && r.type === 'select_ranked_weights') {
            if (Array.isArray(r.from))
                r.from.forEach((n) => selectWeightSubjects.add(n));
            if (Array.isArray(r.weights)) {
                const w = r.weights.map(Number).reduce((a, b) => a + (b || 0), 0);
                return acc + w;
            }
        }
        return acc;
    }, 0);
    const SW = Math.min(1, Math.max(0, selectWeightSum));
    const TOTAL_select = TOTAL * SW;
    const TOTAL_base = TOTAL * (1 - SW);
    const selectNRules = rules.filter((r) => r?.type === 'select_n' && Array.isArray(r.from) && r.count);
    const selectedBySelectN = new Set();
    if (selectNRules.length) {
        for (const r of selectNRules) {
            const cand = r.from
                .filter((name) => !(englishAsBonus && name === '영어'))
                .map((name) => ({ name, norm: normOf(name) }))
                .sort((a, b) => b.norm - a.norm);
            const picked = cand.slice(0, Math.min(Number(r.count) || 1, cand.length));
            picked.forEach((p) => selectedBySelectN.add(p.name));
            log.push(`[select_n] from=[${r.from.join(', ')}], count=${r.count} -> 선택: ${picked.map((p) => p.name).join(', ')}`);
        }
    }
    let baseRatioSum = 0;
    let baseNormWeighted = 0;
    const ratioOf = (name) => Number(F[name] || 0);
    const candidatesBase = ['국어', '수학', '영어', '탐구', ...(historyAsSubject ? ['한국사'] : [])];
    for (const name of candidatesBase) {
        if (englishAsBonus && name === '영어')
            continue;
        const ratio = ratioOf(name);
        if (ratio <= 0)
            continue;
        if (selectWeightSubjects.size && selectWeightSubjects.has(name))
            continue;
        if (selectNRules.length && !selectedBySelectN.has(name))
            continue;
        baseRatioSum += ratio;
        baseNormWeighted += normOf(name) * ratio;
    }
    const baseBeforeRatio = (baseRatioSum > 0 && TOTAL_base > 0)
        ? (baseNormWeighted / baseRatioSum) * TOTAL_base
        : 0;
    let selectBeforeRatio = 0;
    const usedForWeights = new Set();
    for (let i = 0; i < rules.length; i++) {
        const r = rules[i];
        if (!(r && r.type === 'select_ranked_weights' && Array.isArray(r.from) && Array.isArray(r.weights) && r.weights.length)) {
            continue;
        }
        const cand = r.from
            .filter((name) => !(englishAsBonus && name === '영어'))
            .filter((name) => !usedForWeights.has(name))
            .map((name) => ({ name, norm: normOf(name), raw: Number(raw[name] || 0) }))
            .sort((a, b) => b.norm - a.norm);
        const N = Math.min(cand.length, r.weights.length);
        const picked = cand.slice(0, N);
        picked.forEach((p) => usedForWeights.add(p.name));
        const wSum = picked.reduce((acc, c, idx) => acc + (Number(r.weights[idx] || 0) * c.norm), 0);
        selectBeforeRatio += wSum * TOTAL;
    }
    const rawSuneungTotal = baseBeforeRatio + selectBeforeRatio;
    log.push(`[수능원본점수] 기본=${baseBeforeRatio.toFixed(2)}, 선택=${selectBeforeRatio.toFixed(2)}, 합계=${rawSuneungTotal.toFixed(2)} (비율적용 전)`);
    let historyScore = 0;
    if (!historyAsSubject && F.history_scores && S.한국사?.grade != null) {
        const hg = String(S.한국사.grade);
        historyScore = Number(F.history_scores[hg]) || 0;
        log.push(`[한국사] 등급 ${hg} → ${historyScore}점`);
    }
    let englishBonus = 0;
    if (F.english_bonus_scores && S.영어?.grade != null) {
        const eg = String(S.영어.grade);
        englishBonus += Number(F.english_bonus_scores[eg] ?? 0);
        log.push(`[영어 보정] 등급 ${eg} → ${Number(F.english_bonus_scores[eg] ?? 0)}점`);
    }
    if (englishAsBonus && S.영어?.grade != null && F.english_scores) {
        englishBonus += englishGradeBonus;
        log.push(`[영어 보정] (자동판단-가산점모드) 등급 ${S.영어.grade} → ${englishGradeBonus}점`);
    }
    if (englishBonusFixed) {
        englishBonus += englishBonusFixed;
        log.push(`[영어 보정] 고정 보정 ${englishBonusFixed}점`);
    }
    let finalSuneungScore = 0;
    if (otherSettings.한국사우선적용 === true) {
        log.push('[계산방식] 한국사 가산점 우선 적용');
        finalSuneungScore = (rawSuneungTotal + historyScore) * suneungRatio;
        historyScore = 0;
    }
    else {
        finalSuneungScore = rawSuneungTotal * suneungRatio;
    }
    const final = finalSuneungScore + historyScore + englishBonus;
    log.push('========== 최종 ==========');
    log.push(`수능점수(최종) = ${finalSuneungScore.toFixed(2)} / 한국사(후반영) = ${historyScore} / 영어보정 = ${englishBonus}`);
    log.push(`총점 = ${final.toFixed(2)}`);
    return {
        totalScore: final.toFixed(2),
        breakdown: { base: baseBeforeRatio * suneungRatio, select: selectBeforeRatio * suneungRatio, history: historyScore, english_bonus: englishBonus },
        calculationLog: log
    };
}
function calculateScoreWithConv(formulaDataRaw, studentScores, convMap, logHook, highestMap) {
    const cfg = safeParse(formulaDataRaw.score_config, {}) || {};
    const inqType = cfg?.inquiry?.type || '백분위';
    if (inqType === '변환표준점수' && Array.isArray(studentScores?.subjects)) {
        const cloned = JSON.parse(JSON.stringify(studentScores));
        cloned.subjects = (cloned.subjects || []).map((sub) => {
            if (sub.name !== '탐구')
                return sub;
            if (sub.converted_std != null)
                return sub;
            const group = sub.group || sub.type || guessInquiryGroup(sub.subject || '');
            const pct = Number(sub.percentile || 0);
            const conv = mapPercentileToConverted(convMap?.[group], pct);
            if (conv != null) {
                if (typeof logHook === 'function') {
                    logHook(`[변환표준] ${group} 백분위 ${pct} → 변표 ${conv.toFixed(2)} (자동보충)`);
                }
                return { ...sub, converted_std: conv, vstd: conv, std: conv };
            }
            return sub;
        });
        studentScores = cloned;
    }
    return calculateScore(formulaDataRaw, studentScores, highestMap);
}
let CalculatorsService = class CalculatorsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateScore(request) {
        const { U_ID, year, studentScores, basis_exam } = request;
        const basic = await this.prisma.jungsi_basic.findFirst({
            where: { U_ID, year },
        });
        if (!basic) {
            throw new Error(`학과 정보를 찾을 수 없습니다: U_ID=${U_ID}, year=${year}`);
        }
        const ratio = await this.prisma.jungsi_ratio.findFirst({
            where: { U_ID, year },
        });
        if (!ratio) {
            throw new Error(`반영비율 정보를 찾을 수 없습니다: U_ID=${U_ID}, year=${year}`);
        }
        const convRows = await this.prisma.jungsi_inquiry_conv.findMany({
            where: { U_ID, year },
        });
        const convMap = { '사탐': {}, '과탐': {} };
        convRows.forEach(r => {
            const trackKey = r.track === '사탐' ? '사탐' : '과탐';
            convMap[trackKey][String(r.percentile)] = this.toNumber(r.converted_std_score);
        });
        const formulaData = this.buildFormulaData(basic, ratio, convMap);
        const cfg = safeParse(ratio.score_config, {}) || {};
        const mustLoadYearMax = cfg?.korean_math?.max_score_method === 'highest_of_year' ||
            cfg?.inquiry?.max_score_method === 'highest_of_year' ||
            (ratio.calc_type === '특수공식');
        let highestMap = null;
        if (mustLoadYearMax) {
            const exam = basis_exam || cfg?.highest_exam || '수능';
            highestMap = await this.loadHighestMap(year, exam);
        }
        const logBuffer = [];
        const result = calculateScoreWithConv(formulaData, studentScores, convMap, (msg) => logBuffer.push(msg), highestMap);
        if (logBuffer.length && Array.isArray(result.calculationLog)) {
            const idx = result.calculationLog.findIndex((x) => String(x).includes('========== 계산 시작 =========='));
            result.calculationLog.splice((idx >= 0 ? idx + 1 : 1), 0, ...logBuffer);
        }
        return {
            universityName: basic.univ_name || '',
            departmentName: basic.dept_name || '',
            result,
        };
    }
    async calculateBatch(uids, year, studentScores) {
        const results = [];
        for (const U_ID of uids) {
            try {
                const response = await this.calculateScore({ U_ID, year, studentScores });
                results.push(response);
            }
            catch (error) {
                console.error(`Error calculating for U_ID ${U_ID}:`, error);
            }
        }
        return results;
    }
    async calculateAll(year, studentScores) {
        const basics = await this.prisma.jungsi_basic.findMany({
            where: { year },
        });
        const highestMap = await this.loadHighestMap(year, '수능');
        const results = [];
        for (const basic of basics) {
            const U_ID = basic.U_ID;
            try {
                const ratio = await this.prisma.jungsi_ratio.findFirst({
                    where: { U_ID, year },
                });
                if (!ratio)
                    continue;
                const convRows = await this.prisma.jungsi_inquiry_conv.findMany({
                    where: { U_ID, year },
                });
                const convMap = { '사탐': {}, '과탐': {} };
                convRows.forEach(r => {
                    const trackKey = r.track === '사탐' ? '사탐' : '과탐';
                    convMap[trackKey][String(r.percentile)] = this.toNumber(r.converted_std_score);
                });
                const formulaData = this.buildFormulaData(basic, ratio, convMap);
                const result = calculateScoreWithConv(formulaData, studentScores, convMap, null, highestMap);
                results.push({
                    U_ID,
                    university: {
                        U_ID,
                        univName: basic.univ_name || '',
                        deptName: basic.dept_name || '',
                        year: basic.year,
                        gun: basic.gun || '',
                        mojipInwon: basic.quota || '',
                    },
                    finalScore: parseFloat(result.totalScore),
                    breakdown: result.breakdown,
                    calculationLog: result.calculationLog,
                });
            }
            catch (error) {
                console.error(`Error calculating for U_ID ${U_ID}:`, error);
            }
        }
        return results;
    }
    async getUniversityList(year) {
        const basics = await this.prisma.jungsi_basic.findMany({
            where: { year },
            orderBy: [
                { gun: 'asc' },
                { univ_name: 'asc' },
                { dept_name: 'asc' },
            ],
        });
        return basics.map(r => ({
            U_ID: r.U_ID,
            university: r.univ_name,
            department: r.dept_name,
            gun: r.gun,
        }));
    }
    async getFormulaDetails(U_ID, year) {
        const basic = await this.prisma.jungsi_basic.findFirst({
            where: { U_ID, year },
        });
        if (!basic) {
            throw new Error(`학과 정보를 찾을 수 없습니다: U_ID=${U_ID}, year=${year}`);
        }
        const ratio = await this.prisma.jungsi_ratio.findFirst({
            where: { U_ID, year },
        });
        const silgiRows = await this.prisma.jungsi_practical_scores.findMany({
            where: { U_ID, year },
        });
        return {
            ...basic,
            ...ratio,
            실기배점: silgiRows,
        };
    }
    buildFormulaData(basic, ratio, convMap) {
        return {
            U_ID: basic.U_ID,
            대학명: basic.univ_name,
            학과명: basic.dept_name,
            군: basic.gun,
            학년도: basic.year,
            형태: basic.type,
            모집정원: basic.quota,
            총점: this.toNumber(ratio.total_score),
            수능: this.toNumber(ratio.suneung),
            내신: this.toNumber(ratio.naesin),
            실기: this.toNumber(ratio.practical),
            실기총점: this.toNumber(ratio.practical_total),
            국어: this.toNumber(ratio.korean),
            수학: this.toNumber(ratio.math),
            영어: this.toNumber(ratio.english),
            탐구: this.toNumber(ratio.inquiry),
            탐구수: ratio.inquiry_count || 2,
            한국사: ratio.history,
            계산방식: ratio.calc_method,
            계산유형: ratio.calc_type,
            반영방법: ratio.apply_method,
            특수공식: ratio.special_formula,
            기본점수: this.toNumber(ratio.base_score),
            미달처리: ratio.fail_handling,
            기타: ratio.etc,
            선택형여부: ratio.has_selection,
            선택조건: ratio.selection_condition,
            선택가중치: ratio.selection_weights,
            한국사방식: ratio.history_method,
            한국사점수: ratio.history_scores_text,
            english_scores: safeParse(ratio.english_scores, null),
            history_scores: safeParse(ratio.history_scores, null),
            selection_rules: safeParse(ratio.selection_rules, null),
            기타설정: safeParse(ratio.etc_settings, {}),
            bonus_rules: safeParse(ratio.bonus_rules, null),
            score_config: safeParse(ratio.score_config, {}),
            실기모드: ratio.practical_mode,
            실기특수설정: safeParse(ratio.practical_special, null),
            탐구변표: convMap,
        };
    }
    async loadHighestMap(year, exam_type) {
        const rows = await this.prisma.jungsi_highest_scores.findMany({
            where: { year, exam_type },
        });
        const map = {};
        for (const row of rows) {
            map[row.subject_name] = this.toNumber(row.max_score);
        }
        return map;
    }
    toNumber(value) {
        if (value === null || value === undefined)
            return 0;
        if (typeof value === 'number')
            return value;
        if (typeof value === 'string')
            return parseFloat(value) || 0;
        if (typeof value === 'object' && value.toNumber) {
            return value.toNumber();
        }
        return 0;
    }
};
exports.CalculatorsService = CalculatorsService;
exports.CalculatorsService = CalculatorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalculatorsService);
exports.helpers = {
    calculateScoreWithConv,
    calculateScore,
    safeParse,
    buildSpecialContext,
    pickByType,
    kmSubjectNameForKorean,
    kmSubjectNameForMath,
    inquirySubjectName,
    resolveTotal,
    detectEnglishAsBonus,
    isSubjectUsedInRules,
    calcInquiryRepresentative,
    resolveMaxScores,
    evaluateSpecialFormula,
    readConvertedStd,
    mapPercentileToConverted,
    guessInquiryGroup,
};
//# sourceMappingURL=calculators.service.js.map