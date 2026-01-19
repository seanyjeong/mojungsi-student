"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCalculator = void 0;
const types_1 = require("./types");
class BaseCalculator {
    formula;
    student;
    debug = {};
    constructor(formula, student) {
        this.formula = formula;
        this.student = student;
    }
    safeParse(json, fallback) {
        if (json === null || json === undefined)
            return fallback;
        if (typeof json === 'string') {
            try {
                return JSON.parse(json);
            }
            catch {
                return fallback;
            }
        }
        return json;
    }
    resolveTotal() {
        return this.formula.totalScore || 1000;
    }
    resolveSuneungRatio() {
        const ratio = this.formula.suneungRatio || 100;
        return ratio / 100;
    }
    resolveSilgiTotal() {
        return this.formula.silgiTotal || 0;
    }
    resolveSuneungMaxScore() {
        const total = this.resolveTotal();
        const ratio = this.resolveSuneungRatio();
        return total * ratio;
    }
    resolveMaxScores() {
        const sc = this.formula.subjectsConfig;
        let korMax = 100;
        if (sc.korean?.source_type === 'std') {
            korMax = 200;
        }
        let mathMax = 100;
        if (sc.math?.source_type === 'std') {
            mathMax = 200;
        }
        let inqMax = 100;
        if (sc.inquiry?.source_type === 'std') {
            inqMax = 100;
        }
        else if (sc.inquiry?.source_type === 'converted_std') {
            inqMax = 70;
        }
        const englishScores = this.safeParse(this.formula.englishScores, {});
        const engMax = Math.max(...Object.values(englishScores), 100);
        const historyScores = this.safeParse(this.formula.historyScores, {});
        const histValues = Object.values(historyScores);
        const histMax = histValues.length > 0 ? Math.max(...histValues) : 10;
        return {
            국어: korMax,
            수학: mathMax,
            영어: engMax,
            탐구: inqMax,
            한국사: histMax,
        };
    }
    getRatio(subject) {
        const sc = this.formula.subjectsConfig;
        switch (subject) {
            case '국어':
                return sc.korean?.ratio || 0;
            case '수학':
                return sc.math?.ratio || 0;
            case '영어':
                return sc.english?.ratio || 0;
            case '탐구':
                return sc.inquiry?.ratio || 0;
            case '한국사':
                return sc.history?.ratio || 0;
            default:
                return 0;
        }
    }
    calcInquiryRepresentative() {
        const sc = this.formula.subjectsConfig;
        const sourceType = sc.inquiry?.source_type || 'pct';
        const count = sc.inquiry?.count || 2;
        const track1 = this.guessInquiryGroup(this.student.inquiry1Subject);
        const track2 = this.guessInquiryGroup(this.student.inquiry2Subject);
        let inq1, inq2;
        if (sourceType === 'converted_std') {
            inq1 = this.mapPercentileToConverted(this.student.inquiry1Percentile || 0, track1 !== 'unknown' ? track1 : 'social');
            inq2 = this.mapPercentileToConverted(this.student.inquiry2Percentile || 0, track2 !== 'unknown' ? track2 : 'social');
        }
        else if (sourceType === 'pct') {
            inq1 = this.student.inquiry1Percentile || 0;
            inq2 = this.student.inquiry2Percentile || 0;
        }
        else {
            inq1 = this.student.inquiry1Std || 0;
            inq2 = this.student.inquiry2Std || 0;
        }
        const scores = [inq1, inq2].sort((a, b) => b - a);
        if (count === 1) {
            return scores[0];
        }
        return (scores[0] + scores[1]) / 2;
    }
    guessInquiryGroup(subject) {
        if (!subject)
            return 'unknown';
        if (types_1.SOCIAL_INQUIRY_SUBJECTS.includes(subject)) {
            return 'social';
        }
        if (types_1.SCIENCE_INQUIRY_SUBJECTS.includes(subject)) {
            return 'science';
        }
        return 'unknown';
    }
    normalizeSubjectName(name) {
        const normalized = name.toLowerCase().replace(/\s/g, '');
        if (['국어', 'korean', 'kor'].includes(normalized))
            return '국어';
        if (['수학', 'math'].includes(normalized))
            return '수학';
        if (['영어', 'english', 'eng'].includes(normalized))
            return '영어';
        if (['탐구', 'inquiry', 'inq'].includes(normalized))
            return '탐구';
        if (['한국사', 'history', 'hist'].includes(normalized))
            return '한국사';
        return null;
    }
    mapPercentileToConverted(percentile, track) {
        const rounded = Math.round(percentile);
        if (this.formula.inquiryConvTable) {
            const table = track === 'science'
                ? this.formula.inquiryConvTable.science
                : this.formula.inquiryConvTable.social;
            if (table && table[rounded] !== undefined) {
                return table[rounded];
            }
        }
        if (types_1.PERCENTILE_TO_CONVERTED[rounded]) {
            return types_1.PERCENTILE_TO_CONVERTED[rounded];
        }
        if (percentile >= 60) {
            return 30 + ((percentile - 60) / 40) * 40;
        }
        return Math.max(20, percentile / 2);
    }
    detectEnglishAsBonus() {
        return this.getRatio('영어') === 0;
    }
    detectHistoryAsBonus() {
        const sc = this.formula.subjectsConfig;
        return sc.history?.mode === 'bonus' || this.getRatio('한국사') === 0;
    }
    getEnglishScore(grade) {
        const scores = this.safeParse(this.formula.englishScores, {});
        const value = scores[String(grade)];
        return value !== undefined ? Number(value) : 0;
    }
    getEnglishEstimatedPercentile(grade) {
        return types_1.ENGLISH_GRADE_TO_PERCENTILE[grade] || 50;
    }
    getHistoryScore(grade) {
        const scores = this.safeParse(this.formula.historyScores, {});
        const value = scores[String(grade)];
        return value !== undefined ? Number(value) : 0;
    }
    getRawScore(subject) {
        const sc = this.formula.subjectsConfig;
        switch (subject) {
            case '국어': {
                const type = sc.korean?.source_type || 'pct';
                if (type === 'std')
                    return this.student.koreanStd || 0;
                return this.student.koreanPercentile || 0;
            }
            case '수학': {
                const type = sc.math?.source_type || 'pct';
                if (type === 'std')
                    return this.student.mathStd || 0;
                return this.student.mathPercentile || 0;
            }
            case '영어':
                return this.getEnglishScore(this.student.englishGrade);
            case '탐구':
                return this.calcInquiryRepresentative();
            case '한국사':
                return this.getHistoryScore(this.student.historyGrade);
            default:
                return 0;
        }
    }
    normOf(subject, maxScores) {
        const raw = this.getRawScore(subject);
        const max = maxScores[subject];
        if (max === 0)
            return 0;
        return Math.min(Math.max(0, raw / max), 1);
    }
    calculateAllNorms() {
        const maxScores = this.resolveMaxScores();
        return {
            국어: this.normOf('국어', maxScores),
            수학: this.normOf('수학', maxScores),
            영어: this.normOf('영어', maxScores),
            탐구: this.normOf('탐구', maxScores),
            한국사: this.normOf('한국사', maxScores),
        };
    }
    getMathBonusMultiplier() {
        const mathSubject = this.student.mathSubject;
        const bonusRules = this.safeParse(this.formula.bonusRules, []);
        for (const rule of bonusRules) {
            if (rule.type === 'percent_bonus' && rule.subjects?.includes(mathSubject || '')) {
                return 1 + rule.value / 100;
            }
        }
        return 1;
    }
    addDebug(key, value) {
        this.debug[key] = value;
    }
}
exports.BaseCalculator = BaseCalculator;
//# sourceMappingURL=base.calculator.js.map