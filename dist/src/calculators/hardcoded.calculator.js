"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardcodedCalculator = void 0;
const base_calculator_1 = require("./base.calculator");
class HardcodedCalculator extends base_calculator_1.BaseCalculator {
    constructor(formula, student) {
        super(formula, student);
    }
    calculate() {
        const uid = this.formula.legacyUid;
        if (uid === 148 || uid === 149 || uid === 1148 || uid === 1149) {
            return this.calculateSunmoon();
        }
        if (uid === 76 || uid === 1076) {
            return this.calculateKyungdong();
        }
        throw new Error(`HardcodedCalculator: Unknown U_ID ${uid}`);
    }
    calculateSunmoon() {
        const gradeToScore = {
            1: 100,
            2: 93,
            3: 86,
            4: 79,
            5: 72,
            6: 65,
            7: 58,
            8: 51,
            9: 44,
        };
        const korGrade = this.student.koreanGrade || 9;
        const mathGrade = this.student.mathGrade || 9;
        const engGrade = this.student.englishGrade || 9;
        const inq1Grade = this.student.inquiry1Grade || 9;
        const inq2Grade = this.student.inquiry2Grade || 9;
        const bestInqGrade = Math.min(inq1Grade, inq2Grade);
        const korScore = gradeToScore[korGrade] || 0;
        const mathScore = gradeToScore[mathGrade] || 0;
        const engScore = gradeToScore[engGrade] || 0;
        const inqScore = gradeToScore[bestInqGrade] || 0;
        this.addDebug('grades', { korGrade, mathGrade, engGrade, bestInqGrade });
        this.addDebug('scores', { korScore, mathScore, engScore, inqScore });
        const allScores = [korScore, mathScore, engScore, inqScore].sort((a, b) => b - a);
        const top2Sum = allScores[0] + allScores[1];
        this.addDebug('top2', { first: allScores[0], second: allScores[1], sum: top2Sum });
        const histGrade = this.student.historyGrade;
        let histScore = 0;
        if (histGrade && this.formula.historyScores) {
            histScore = Number(this.formula.historyScores[String(histGrade)] || 0);
        }
        this.addDebug('history', { grade: histGrade, score: histScore });
        const finalScore = top2Sum + histScore;
        const total = this.resolveTotal();
        const suneungMaxScore = this.resolveSuneungMaxScore();
        const silgiMaxScore = this.resolveSilgiTotal();
        return {
            finalScore: Math.round(finalScore * 100) / 100,
            breakdown: {
                baseScore: top2Sum,
                selectScore: 0,
                englishBonus: 0,
                historyBonus: histScore,
                suneungRatio: 1,
                rawTotal: finalScore,
            },
            scoreInfo: {
                totalScore: total,
                suneungMaxScore: Math.round(suneungMaxScore * 100) / 100,
                silgiMaxScore: silgiMaxScore,
            },
            debug: this.debug,
        };
    }
    calculateKyungdong() {
        const scoreTable = {
            1: 700.0,
            2: 692.0,
            3: 684.0,
            4: 676.0,
            5: 668.0,
            6: 660.0,
            7: 652.0,
            8: 644.0,
            9: 630.0,
        };
        const korGrade = this.student.koreanGrade || 9;
        const mathGrade = this.student.mathGrade || 9;
        const engGrade = this.student.englishGrade || 9;
        const inq1Grade = this.student.inquiry1Grade || 9;
        const inq2Grade = this.student.inquiry2Grade || 9;
        const bestInqGrade = Math.min(inq1Grade, inq2Grade);
        this.addDebug('grades', { korGrade, mathGrade, engGrade, bestInqGrade });
        const gradeSum = korGrade + mathGrade + engGrade + bestInqGrade;
        const gradeAvg = gradeSum / 4.0;
        this.addDebug('gradeSum', gradeSum);
        this.addDebug('gradeAvg', gradeAvg);
        let uniGrade = Math.floor(gradeAvg);
        uniGrade = Math.max(1, Math.min(9, uniGrade));
        this.addDebug('uniGrade', uniGrade);
        const finalScore = scoreTable[uniGrade] || 630.0;
        const total = this.resolveTotal();
        const suneungMaxScore = this.resolveSuneungMaxScore();
        const silgiMaxScore = this.resolveSilgiTotal();
        return {
            finalScore: Math.round(finalScore * 100) / 100,
            breakdown: {
                baseScore: finalScore,
                selectScore: 0,
                englishBonus: 0,
                historyBonus: 0,
                suneungRatio: 1,
                rawTotal: finalScore,
            },
            scoreInfo: {
                totalScore: total,
                suneungMaxScore: Math.round(suneungMaxScore * 100) / 100,
                silgiMaxScore: silgiMaxScore,
            },
            debug: this.debug,
        };
    }
}
exports.HardcodedCalculator = HardcodedCalculator;
//# sourceMappingURL=hardcoded.calculator.js.map