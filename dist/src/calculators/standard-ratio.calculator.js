"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardRatioCalculator = void 0;
const base_calculator_1 = require("./base.calculator");
class StandardRatioCalculator extends base_calculator_1.BaseCalculator {
    constructor(formula, student) {
        super(formula, student);
    }
    calculate() {
        const total = this.resolveTotal();
        const suneungRatio = this.resolveSuneungRatio();
        const maxScores = this.resolveMaxScores();
        const norms = this.calculateAllNorms();
        const englishAsBonus = this.detectEnglishAsBonus();
        const historyAsBonus = this.detectHistoryAsBonus();
        this.addDebug('total', total);
        this.addDebug('suneungRatio', suneungRatio);
        this.addDebug('maxScores', maxScores);
        this.addDebug('norms', norms);
        this.addDebug('englishAsBonus', englishAsBonus);
        const rawRules = this.safeParse(this.formula.selectionRules, []);
        const selectionRules = Array.isArray(rawRules)
            ? rawRules
            : rawRules
                ? [rawRules]
                : [];
        const selectNRule = selectionRules.find((r) => r.type === 'select_n');
        const selectNSubjects = selectNRule
            ? this.applySelectN(selectNRule, norms)
            : null;
        const selectWeightRules = selectionRules.filter((r) => r.type === 'select_ranked_weights');
        const selectWeightSubjects = new Set();
        for (const rule of selectWeightRules) {
            for (const subj of rule.from) {
                const normalized = this.normalizeSubjectName(subj);
                if (normalized)
                    selectWeightSubjects.add(normalized);
            }
        }
        this.addDebug('selectNRule', selectNRule);
        this.addDebug('selectNSubjects', selectNSubjects);
        this.addDebug('selectWeightSubjects', Array.from(selectWeightSubjects));
        let baseNormWeighted = 0;
        let baseRatioSum = 0;
        const subjects = ['국어', '수학', '영어', '탐구', '한국사'];
        for (const subject of subjects) {
            if (englishAsBonus && subject === '영어') {
                continue;
            }
            if (selectWeightSubjects.has(subject)) {
                continue;
            }
            if (selectNSubjects && !selectNSubjects.has(subject)) {
                continue;
            }
            const ratio = this.getRatio(subject);
            if (ratio > 0) {
                baseRatioSum += ratio;
                baseNormWeighted += norms[subject] * ratio;
            }
        }
        const totalSelectRatio = this.calculateSelectTotalRatio(selectWeightRules);
        const baseTotal = total * (1 - totalSelectRatio);
        let baseBeforeRatio = 0;
        if (baseRatioSum > 0) {
            baseBeforeRatio = (baseNormWeighted / baseRatioSum) * baseTotal;
        }
        this.addDebug('baseNormWeighted', baseNormWeighted);
        this.addDebug('baseRatioSum', baseRatioSum);
        this.addDebug('totalSelectRatio', totalSelectRatio);
        this.addDebug('baseTotal', baseTotal);
        this.addDebug('baseBeforeRatio', baseBeforeRatio);
        const used = new Set();
        let selectBeforeRatio = 0;
        for (const rule of selectWeightRules) {
            const candidates = [];
            for (const subjName of rule.from) {
                const normalized = this.normalizeSubjectName(subjName);
                if (normalized && !used.has(normalized)) {
                    candidates.push({ name: normalized, norm: norms[normalized] });
                }
            }
            candidates.sort((a, b) => b.norm - a.norm);
            const weights = rule.weights || [];
            for (let i = 0; i < weights.length && i < candidates.length; i++) {
                selectBeforeRatio += weights[i] * candidates[i].norm * total;
                used.add(candidates[i].name);
            }
        }
        this.addDebug('selectBeforeRatio', selectBeforeRatio);
        let historyScore = 0;
        let englishBonus = 0;
        const historyRatio = this.getRatio('한국사');
        if (historyRatio === 0) {
            historyScore = this.getHistoryScore(this.student.historyGrade);
        }
        if (englishAsBonus) {
            englishBonus = this.getEnglishScore(this.student.englishGrade);
        }
        const englishBonusScores = this.safeParse(this.formula.englishBonusScores, {});
        if (englishBonusScores[String(this.student.englishGrade)] !== undefined) {
            englishBonus += englishBonusScores[String(this.student.englishGrade)];
        }
        if (this.formula.englishBonusFixed) {
            englishBonus += this.formula.englishBonusFixed;
        }
        this.addDebug('historyScore', historyScore);
        this.addDebug('englishBonus', englishBonus);
        const rawSuneungTotal = baseBeforeRatio + selectBeforeRatio;
        const finalSuneungScore = rawSuneungTotal * suneungRatio;
        const finalScore = finalSuneungScore + historyScore + englishBonus;
        const suneungMaxScore = this.resolveSuneungMaxScore();
        const silgiMaxScore = this.resolveSilgiTotal();
        this.addDebug('rawSuneungTotal', rawSuneungTotal);
        this.addDebug('finalSuneungScore', finalSuneungScore);
        this.addDebug('finalScore', finalScore);
        this.addDebug('suneungMaxScore', suneungMaxScore);
        this.addDebug('silgiMaxScore', silgiMaxScore);
        return {
            finalScore: Math.round(finalScore * 100) / 100,
            breakdown: {
                baseScore: Math.round(baseBeforeRatio * 100) / 100,
                selectScore: Math.round(selectBeforeRatio * 100) / 100,
                englishBonus: Math.round(englishBonus * 100) / 100,
                historyBonus: Math.round(historyScore * 100) / 100,
                suneungRatio: suneungRatio,
                rawTotal: Math.round(rawSuneungTotal * 100) / 100,
            },
            scoreInfo: {
                totalScore: total,
                suneungMaxScore: Math.round(suneungMaxScore * 100) / 100,
                silgiMaxScore: silgiMaxScore,
            },
            debug: this.debug,
        };
    }
    applySelectN(rule, norms) {
        const count = rule.count || rule.from.length;
        const candidates = [];
        for (const subjName of rule.from) {
            const normalized = this.normalizeSubjectName(subjName);
            if (normalized) {
                candidates.push({ name: normalized, norm: norms[normalized] });
            }
        }
        candidates.sort((a, b) => b.norm - a.norm);
        const selected = new Set();
        for (let i = 0; i < count && i < candidates.length; i++) {
            selected.add(candidates[i].name);
        }
        this.addDebug('selectN_candidates', candidates);
        this.addDebug('selectN_selected', Array.from(selected));
        return selected;
    }
    calculateSelectTotalRatio(rules) {
        let total = 0;
        for (const rule of rules) {
            const weights = rule.weights || [];
            total += weights.reduce((sum, w) => sum + w, 0);
        }
        return total;
    }
}
exports.StandardRatioCalculator = StandardRatioCalculator;
//# sourceMappingURL=standard-ratio.calculator.js.map