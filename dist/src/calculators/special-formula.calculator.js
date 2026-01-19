"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialFormulaCalculator = void 0;
const base_calculator_1 = require("./base.calculator");
const types_1 = require("./types");
const math = __importStar(require("mathjs"));
class SpecialFormulaCalculator extends base_calculator_1.BaseCalculator {
    constructor(formula, student) {
        super(formula, student);
    }
    calculate() {
        const legacyFormula = this.formula.legacyFormula;
        if (!legacyFormula) {
            throw new Error('SpecialFormulaCalculator requires legacyFormula');
        }
        const context = this.buildContext();
        this.addDebug('context', context);
        let evaluableFormula = legacyFormula;
        for (const [key, value] of Object.entries(context)) {
            const regex = new RegExp(`\\{${key}\\}`, 'g');
            evaluableFormula = evaluableFormula.replace(regex, String(value));
        }
        this.addDebug('originalFormula', legacyFormula);
        this.addDebug('evaluableFormula', evaluableFormula);
        let finalScore;
        try {
            const result = math.evaluate(evaluableFormula);
            if (result && typeof result === 'object' && result.entries) {
                finalScore = Number(result.entries[result.entries.length - 1]);
            }
            else {
                finalScore = Number(result);
            }
        }
        catch (error) {
            this.addDebug('evaluationError', String(error));
            throw new Error(`Failed to evaluate formula: ${error}`);
        }
        this.addDebug('finalScore', finalScore);
        const total = this.resolveTotal();
        const suneungMaxScore = this.resolveSuneungMaxScore();
        const silgiMaxScore = this.resolveSilgiTotal();
        return {
            finalScore: Math.round(finalScore * 100) / 100,
            breakdown: {
                baseScore: Math.round(finalScore * 100) / 100,
                selectScore: 0,
                englishBonus: 0,
                historyBonus: 0,
                suneungRatio: this.resolveSuneungRatio(),
                rawTotal: Math.round(finalScore * 100) / 100,
            },
            scoreInfo: {
                totalScore: total,
                suneungMaxScore: Math.round(suneungMaxScore * 100) / 100,
                silgiMaxScore: silgiMaxScore,
            },
            debug: this.debug,
        };
    }
    buildContext() {
        const ctx = {};
        const sc = this.formula.subjectsConfig;
        ctx.total = this.resolveTotal();
        ctx.suneung_ratio = this.resolveSuneungRatio();
        ctx.ratio_kor = sc.korean?.ratio || 0;
        ctx.ratio_math = sc.math?.ratio || 0;
        ctx.ratio_inq = sc.inquiry?.ratio || 0;
        ctx.ratio_eng = sc.english?.ratio || 0;
        ctx.ratio_kor_norm = ctx.ratio_kor / 100;
        ctx.ratio_math_norm = ctx.ratio_math / 100;
        ctx.ratio_inq_norm = ctx.ratio_inq / 100;
        ctx.ratio5_kor = ctx.ratio_kor_norm * 5;
        ctx.ratio5_math = ctx.ratio_math_norm * 5;
        ctx.ratio5_inq = ctx.ratio_inq_norm * 5;
        ctx.kor_max = 200;
        ctx.math_max = 200;
        ctx.kor_std = this.student.koreanStd || 0;
        ctx.kor_pct = this.student.koreanPercentile || 0;
        ctx.math_std = this.student.mathStd || 0;
        ctx.math_pct = this.student.mathPercentile || 0;
        const mathBonus = this.getMathBonusMultiplier();
        ctx.math_std_bonused = ctx.math_std * mathBonus;
        ctx.math_pct_bonused = ctx.math_pct * mathBonus;
        ctx.max_kor_math_std = Math.max(ctx.kor_std, ctx.math_std_bonused);
        ctx.max_kor_math_pct = Math.max(ctx.kor_pct, ctx.math_pct_bonused);
        ctx.math_bonus_pct_10 = this.isMathBonusEligible()
            ? ctx.math_pct * 0.1
            : 0;
        ctx.eng_grade = this.student.englishGrade;
        ctx.eng_grade_score = this.getEnglishScore(this.student.englishGrade);
        const englishScores = this.safeParse(this.formula.englishScores, {});
        const engVals = Object.values(englishScores).map(Number).filter((n) => !isNaN(n));
        ctx.eng_max = engVals.length ? Math.max(...engVals) : 100;
        ctx.eng_pct_est =
            ctx.eng_max > 0
                ? Math.min(100, Math.max(0, (ctx.eng_grade_score / ctx.eng_max) * 100))
                : 0;
        ctx.hist_grade = this.student.historyGrade;
        ctx.hist_grade_score = this.getHistoryScore(this.student.historyGrade);
        const inq1Std = this.student.inquiry1Std || 0;
        const inq2Std = this.student.inquiry2Std || 0;
        const inq1Pct = this.student.inquiry1Percentile || 0;
        const inq2Pct = this.student.inquiry2Percentile || 0;
        const inq1Converted = this.mapPercentileToConverted(inq1Pct);
        const inq2Converted = this.mapPercentileToConverted(inq2Pct);
        const sortedConverted = [inq1Converted, inq2Converted].sort((a, b) => b - a);
        ctx.inq1_converted_std = sortedConverted[0];
        ctx.inq2_converted_std = sortedConverted[1];
        ctx.inq_sum2_converted_std = sortedConverted[0] + sortedConverted[1];
        ctx.inq_avg2_converted_std = ctx.inq_sum2_converted_std / 2;
        const sortedStd = [inq1Std, inq2Std].sort((a, b) => b - a);
        ctx.inq1_std = sortedStd[0];
        ctx.inq2_std = sortedStd[1];
        ctx.inq_sum2_std = sortedStd[0] + sortedStd[1];
        ctx.inq_avg2_std = ctx.inq_sum2_std / 2;
        const sortedPct = [inq1Pct, inq2Pct].sort((a, b) => b - a);
        ctx.inq1_percentile = sortedPct[0];
        ctx.inq2_percentile = sortedPct[1];
        ctx.inq_sum2_percentile = sortedPct[0] + sortedPct[1];
        ctx.inq_avg2_percentile = ctx.inq_sum2_percentile / 2;
        ctx.inq1_max_std = 70;
        ctx.inq2_max_std = 70;
        ctx.inq_max_pct = 100;
        const itemsStdKmeInq1Doubled = [
            ctx.kor_std,
            ctx.math_std,
            ctx.eng_grade_score,
            ctx.inq1_std * 2,
        ].sort((a, b) => b - a);
        ctx.top3_sum_std_kme_inq1_doubled =
            itemsStdKmeInq1Doubled[0] + itemsStdKmeInq1Doubled[1] + itemsStdKmeInq1Doubled[2];
        const top3NoEng = [ctx.kor_pct, ctx.math_pct, ctx.inq1_percentile].sort((a, b) => b - a);
        ctx.top3_avg_pct_kor_math_inq1 =
            top3NoEng.reduce((s, x) => s + x, 0) / top3NoEng.length;
        const top3WithEng = [
            ctx.kor_pct,
            ctx.math_pct,
            ctx.inq1_percentile,
            ctx.eng_pct_est,
        ].sort((a, b) => b - a);
        ctx.top3_avg_pct =
            (top3WithEng[0] + top3WithEng[1] + top3WithEng[2]) / 3;
        const top2AvgPctKme = [ctx.kor_pct, ctx.math_pct, ctx.eng_pct_est].sort((a, b) => b - a);
        ctx.top2_avg_pct_kme = (top2AvgPctKme[0] + top2AvgPctKme[1]) / 2;
        const top3AvgPctKmeInqAvg = [
            ctx.kor_pct,
            ctx.math_pct,
            ctx.inq_avg2_percentile,
            ctx.eng_pct_est,
        ].sort((a, b) => b - a);
        ctx.top3_avg_pct_kme_inqAvg =
            (top3AvgPctKmeInqAvg[0] + top3AvgPctKmeInqAvg[1] + top3AvgPctKmeInqAvg[2]) / 3;
        ctx.top2_sum_scaled60_kme_inqAvg =
            (top3AvgPctKmeInqAvg[0] + top3AvgPctKmeInqAvg[1]) * 0.6;
        ctx.top1_math_or_eng_pct = Math.max(ctx.math_pct, ctx.eng_pct_est);
        const ratioEngNorm = (sc.english?.ratio || 0) / 100;
        const scaledKme = [
            ctx.kor_pct * ctx.ratio_kor_norm,
            ctx.math_pct * ctx.ratio_math_norm,
            ctx.eng_grade_score * ratioEngNorm,
        ].sort((a, b) => b - a);
        ctx.top2_sum_scaled_kme = scaledKme[0] + scaledKme[1];
        const top2KmInq = [ctx.kor_pct, ctx.math_pct, ctx.inq_avg2_percentile].sort((a, b) => b - a);
        const sum80pct = (top2KmInq[0] + top2KmInq[1]) * 0.4;
        ctx.top2_kmInq_scaled_80_x_6 = sum80pct * 6;
        ctx.top2_kmInq_scaled_80_x_7 = sum80pct * 7;
        const itemsPctKmi2 = [
            ctx.kor_pct,
            ctx.math_pct,
            ctx.inq1_percentile,
            ctx.inq2_percentile,
        ].sort((a, b) => b - a);
        ctx.top2_sum_norm_pct_kmi2 = (itemsPctKmi2[0] + itemsPctKmi2[1]) / 100;
        ctx.top2_sum_raw_pct_kmi2 = itemsPctKmi2[0] + itemsPctKmi2[1];
        const kmeScoresForTop2 = [ctx.kor_pct, ctx.math_pct, ctx.eng_grade_score].sort((a, b) => b - a);
        ctx.top2_sum_raw_pct_kme = kmeScoresForTop2[0] + kmeScoresForTop2[1];
        ctx.inq1_social_boost = this.isSocialInquiry(this.student.inquiry1Subject)
            ? 1.05
            : 1.0;
        ctx.inq2_social_boost = this.isSocialInquiry(this.student.inquiry2Subject)
            ? 1.05
            : 1.0;
        return ctx;
    }
    isMathBonusEligible() {
        const subject = this.student.mathSubject || '';
        return /미적분|기하/.test(subject);
    }
    isSocialInquiry(subject) {
        if (!subject)
            return false;
        return types_1.SOCIAL_INQUIRY_SUBJECTS.some((s) => subject.includes(s));
    }
}
exports.SpecialFormulaCalculator = SpecialFormulaCalculator;
//# sourceMappingURL=special-formula.calculator.js.map