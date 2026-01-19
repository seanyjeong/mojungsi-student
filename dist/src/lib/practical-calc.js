"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SPECIAL_MODE_UIDS = void 0;
exports.getEventRules = getEventRules;
exports.findMaxScore = findMaxScore;
exports.findMinScore = findMinScore;
exports.lookupDeductionLevel = lookupDeductionLevel;
exports.lookupScore = lookupScore;
exports.convertGradeToScore = convertGradeToScore;
exports.calcPracticalSpecial = calcPracticalSpecial;
exports.calculatePracticalScore = calculatePracticalScore;
function getEventRules(eventName) {
    const name = eventName || '';
    const LOW_IS_BETTER_KEYWORDS = ['m', 'run', '왕복', '초', '벽', '지그', 'z', 'Z'];
    let method = 'higher_is_better';
    if (LOW_IS_BETTER_KEYWORDS.some((k) => name.includes(k))) {
        method = 'lower_is_better';
    }
    if (name.includes('던지기') || name.includes('멀리뛰기')) {
        method = 'higher_is_better';
    }
    return { method };
}
function findMaxScore(scoreTable) {
    if (!scoreTable || scoreTable.length === 0)
        return 0;
    return scoreTable
        .map((l) => Number(l.배점))
        .filter((n) => !isNaN(n))
        .reduce((m, cur) => Math.max(m, cur), 0);
}
function findMinScore(scoreTable) {
    if (!scoreTable || scoreTable.length === 0)
        return 0;
    const keywordsToIgnore = ['F', 'G', '미응시', '파울', '실격', 'P', 'PASS'];
    const allScores = [];
    for (const level of scoreTable) {
        const recordStr = String(level.기록).trim().toUpperCase();
        if (keywordsToIgnore.includes(recordStr))
            continue;
        const score = Number(level.배점);
        if (!isNaN(score)) {
            allScores.push(score);
        }
    }
    return allScores.length > 0 ? Math.min(...allScores) : 0;
}
function lookupDeductionLevel(studentScore, scoreTable) {
    if (!scoreTable || scoreTable.length === 0)
        return 0;
    const allScores = [...new Set(scoreTable
            .map((l) => Number(l.배점))
            .filter((n) => !isNaN(n)))];
    allScores.sort((a, b) => b - a);
    const studentScoreNum = Number(studentScore);
    if (isNaN(studentScoreNum))
        return 0;
    const levelIndex = allScores.indexOf(studentScoreNum);
    return levelIndex === -1 ? 0 : levelIndex;
}
function lookupScore(studentRecord, method, scoreTable, outOfRangeRule = '0점') {
    if (!scoreTable || scoreTable.length === 0)
        return 0;
    const studentValueStr = String(studentRecord).trim().toUpperCase();
    const FORCE_MIN_SCORE_KEYWORDS = ['F', 'G', '미응시', '파울', '실격'];
    if (FORCE_MIN_SCORE_KEYWORDS.includes(studentValueStr)) {
        return findMinScore(scoreTable);
    }
    const studentValueNum = Number(studentValueStr);
    const isNumericInput = !isNaN(studentValueNum) && studentValueStr !== '';
    const numericLevels = [];
    const exactMatchLevels = new Map();
    const rangeLevels = [];
    for (const level of scoreTable) {
        const recordStr = String(level.기록).trim();
        const recordNum = Number(recordStr);
        if (!isNaN(recordNum) && recordStr !== '') {
            numericLevels.push({ record: recordNum, grade: level.배점 });
        }
        else if (recordStr.includes('이상') ||
            recordStr.includes('이하') ||
            recordStr.includes('초과') ||
            recordStr.includes('미만')) {
            rangeLevels.push({ rangeStr: recordStr, grade: level.배점 });
        }
        else {
            exactMatchLevels.set(recordStr.toUpperCase(), level.배점);
        }
    }
    if (exactMatchLevels.has(studentValueStr)) {
        return exactMatchLevels.get(studentValueStr) || 0;
    }
    if (isNumericInput) {
        for (const level of rangeLevels) {
            const parts = level.rangeStr.match(/([0-9.]+)\s*(이상|이하|초과|미만)/);
            if (parts && parts[1]) {
                const limit = Number(parts[1]);
                const type = parts[2];
                if (type === '이상' && studentValueNum >= limit)
                    return level.grade;
                if (type === '이하' && studentValueNum <= limit)
                    return level.grade;
                if (type === '초과' && studentValueNum > limit)
                    return level.grade;
                if (type === '미만' && studentValueNum < limit)
                    return level.grade;
            }
        }
        if (numericLevels.length > 0) {
            numericLevels.sort((a, b) => b.record - a.record);
            if (method === 'lower_is_better') {
                for (const level of numericLevels) {
                    if (studentValueNum >= level.record)
                        return level.grade;
                }
                return numericLevels[numericLevels.length - 1].grade;
            }
            else {
                for (const level of numericLevels) {
                    if (studentValueNum >= level.record)
                        return level.grade;
                }
                return numericLevels[numericLevels.length - 1].grade;
            }
        }
    }
    if (outOfRangeRule === '최하점') {
        return findMinScore(scoreTable);
    }
    return 0;
}
function convertGradeToScore(grade) {
    const g = String(grade).toUpperCase();
    if (g === 'P' || g === 'PASS')
        return 100;
    if (g === 'NP' || g === 'N' || g === 'FAIL')
        return 0;
    const score = Number(grade);
    return isNaN(score) ? 0 : score;
}
function practicalTopN(list, n, maxScore) {
    if (!list || list.length === 0)
        return 0;
    const sorted = [...list].sort((a, b) => (b.score || 0) - (a.score || 0));
    const picked = sorted.slice(0, n);
    const sum = picked.reduce((s, r) => s + (r.score || 0), 0);
    return (sum / (n * 100)) * maxScore;
}
function calcPracticalSpecial(uId, list, gender) {
    const scoreMap = new Map();
    for (const item of list) {
        scoreMap.set(item.event, item.score || 0);
    }
    const cleaned = list.filter((it) => Number.isFinite(it.score) && (it.score || 0) > 0);
    const sumOfAllScores = Array.from(scoreMap.values()).reduce((sum, score) => sum + score, 0);
    const sumOfCleanedScores = cleaned.reduce((sum, item) => sum + (item.score || 0), 0);
    switch (uId) {
        case 2: {
            if (sumOfCleanedScores >= 286)
                return 700;
            if (sumOfCleanedScores >= 271)
                return 691;
            if (sumOfCleanedScores >= 256)
                return 682;
            if (sumOfCleanedScores >= 241)
                return 673;
            if (sumOfCleanedScores >= 226)
                return 664;
            if (sumOfCleanedScores >= 211)
                return 655;
            if (sumOfCleanedScores >= 196)
                return 646;
            if (sumOfCleanedScores >= 181)
                return 637;
            return 630;
        }
        case 3:
            return sumOfCleanedScores + 1;
        case 13: {
            if (gender !== '남' && gender !== '여')
                return 0;
            const standards = {
                배근력: { 남: { min: 130, max: 220 }, 여: { min: 60, max: 151 } },
                좌전굴: { 남: { min: 11.9, max: 30 }, 여: { min: 13.9, max: 32 } },
                제자리멀리뛰기: { 남: { min: 254, max: 300 }, 여: { min: 199, max: 250 } },
                중량메고달리기: { 남: { min: 9.9, max: 7.19 }, 여: { min: 10.9, max: 7.6 } },
            };
            let totalScore = 0;
            for (const item of list) {
                const eventName = item.event;
                const std = standards[eventName]?.[gender];
                const record = parseFloat(item.record);
                if (!std || isNaN(record)) {
                    item.score = 0;
                    continue;
                }
                const { min, max } = std;
                let cappedRecord = record;
                const isLowerBetter = max < min;
                if (isLowerBetter) {
                    if (record < max)
                        cappedRecord = max;
                    if (record > min)
                        cappedRecord = min;
                }
                else {
                    if (record > max)
                        cappedRecord = max;
                    if (record < min)
                        cappedRecord = min;
                }
                const eventScore = max - min === 0 ? 0 : ((cappedRecord - min) / (max - min)) * 100;
                item.score = Math.round(eventScore * 100) / 100;
                totalScore += item.score;
            }
            return Math.round(totalScore * 100) / 100;
        }
        case 16: {
            const runScore = scoreMap.get('10m왕복달리기') || 0;
            const jumpScore = scoreMap.get('제자리멀리뛰기') || 0;
            const situpScore = scoreMap.get('윗몸일으키기') || 0;
            return runScore * 9.8 + jumpScore * 9.8 + situpScore * 8.4;
        }
        case 17: {
            const runScore = scoreMap.get('10m왕복달리기') || 0;
            const jumpScore = scoreMap.get('제자리멀리뛰기') || 0;
            const situpScore = scoreMap.get('윗몸일으키기') || 0;
            return runScore * 5.6 + jumpScore * 5.6 + situpScore * 4.8;
        }
        case 19:
            return sumOfCleanedScores + 2;
        case 69:
        case 70:
            return (sumOfAllScores / 3) * 4 + 400;
        case 71:
            return sumOfAllScores;
        case 99:
        case 147:
            return practicalTopN(cleaned, 3, 800);
        case 121: {
            let passCount = 0;
            for (const item of list) {
                const gradeStr = String(item.rawGrade || '').toUpperCase();
                if (gradeStr === 'P' || gradeStr === 'PASS') {
                    passCount++;
                }
            }
            return 100 * passCount + 200;
        }
        case 146:
            return practicalTopN(cleaned, 3, 400);
        case 151:
        case 152:
            return ((sumOfAllScores / 3) - 80) * (7 / 6) + 560;
        case 153:
            return ((sumOfAllScores / 2) - 80) + 480;
        case 160: {
            const runScore = scoreMap.get('20m왕복달리기') || 0;
            const jumpScore = scoreMap.get('제자리멀리뛰기') || 0;
            const throwScore = scoreMap.get('메디신볼던지기') || 0;
            const rawTotal = (runScore * 4) + (jumpScore * 3) + (throwScore * 3);
            return (rawTotal / 1000) * 700;
        }
        case 175:
            return sumOfAllScores / 3;
        case 184:
            return (sumOfAllScores / 300) * 280;
        case 186:
            return sumOfCleanedScores + 300;
        case 189:
        case 199:
            return sumOfCleanedScores + 20;
        case 194:
        case 197:
            return sumOfCleanedScores * 0.5 * 0.8;
        default:
            return 0;
    }
}
function calculatePracticalScore(config, scoreTable, studentRecords, gender) {
    const { practicalMode, practicalTotal, baseScore, failHandling, U_ID } = config;
    const eventBreakdowns = [];
    let totalDeduction = 0;
    for (const rec of studentRecords) {
        const eventName = rec.event;
        const eventValue = rec.record.trim();
        const eventScoreTable = scoreTable[eventName] || [];
        const { method } = getEventRules(eventName);
        if (!eventValue) {
            eventBreakdowns.push({
                event: eventName,
                record: '',
                score: undefined,
                deduction: undefined,
            });
            continue;
        }
        const rawGrade = lookupScore(eventValue, method, eventScoreTable, failHandling);
        const score = convertGradeToScore(rawGrade);
        const deduction = lookupDeductionLevel(score, eventScoreTable);
        eventBreakdowns.push({
            event: eventName,
            record: eventValue,
            score,
            deduction,
            rawGrade: String(rawGrade),
        });
        totalDeduction += deduction;
    }
    if (practicalMode === 'special') {
        const finalScore = calcPracticalSpecial(U_ID, eventBreakdowns, gender);
        return {
            totalScore: Math.round(finalScore * 1000) / 1000,
            events: eventBreakdowns,
            totalDeduction,
        };
    }
    let rawSum = 0;
    let tableMaxSum = 0;
    for (const ev of eventBreakdowns) {
        if (ev.score !== undefined) {
            rawSum += ev.score;
        }
        const eventTable = scoreTable[ev.event] || [];
        tableMaxSum += findMaxScore(eventTable);
    }
    const finalRawScore = rawSum + baseScore;
    const finalScore = tableMaxSum > 0
        ? (finalRawScore / tableMaxSum) * practicalTotal
        : 0;
    return {
        totalScore: Math.round(finalScore * 1000) / 1000,
        events: eventBreakdowns,
        totalDeduction,
    };
}
exports.SPECIAL_MODE_UIDS = [
    2, 3, 13, 16, 17, 19, 69, 70, 71, 99, 121, 146, 147, 151, 152, 153, 160, 175, 184, 186, 189, 194, 197, 199
];
//# sourceMappingURL=practical-calc.js.map