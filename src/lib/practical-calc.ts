/**
 * 실기 점수 계산 모듈
 * 원본: maxjungsi222/silgical.js
 */

// ========== 타입 정의 ==========

export interface ScoreRow {
  기록: string;
  배점: number;
  성별?: string;
}

export interface EventRecord {
  event: string;
  record: string;
  score?: number;
  deduction?: number;
  rawGrade?: string;
}

export interface PracticalConfig {
  practicalMode: 'basic' | 'special';
  practicalTotal: number;
  baseScore: number;
  failHandling: string;
  specialConfig?: any;
  U_ID: number;
}

export interface PracticalResult {
  totalScore: number;
  events: EventRecord[];
  totalDeduction: number;
}

// ========== 헬퍼 함수 ==========

/**
 * 종목명으로 기록방식 판단
 * @returns 'lower_is_better' = 시간 종목 (낮을수록 좋음)
 * @returns 'higher_is_better' = 거리/개수 종목 (높을수록 좋음)
 */
export function getEventRules(eventName: string): { method: 'lower_is_better' | 'higher_is_better' } {
  const name = eventName || '';
  const LOW_IS_BETTER_KEYWORDS = ['m', 'run', '왕복', '초', '벽', '지그', 'z', 'Z'];

  let method: 'lower_is_better' | 'higher_is_better' = 'higher_is_better';

  if (LOW_IS_BETTER_KEYWORDS.some((k) => name.includes(k))) {
    method = 'lower_is_better';
  }
  // 던지기/멀리뛰기는 항상 높을수록 좋음
  if (name.includes('던지기') || name.includes('멀리뛰기')) {
    method = 'higher_is_better';
  }

  return { method };
}

/**
 * 배점표에서 최고 배점(만점)을 찾음
 */
export function findMaxScore(scoreTable: ScoreRow[]): number {
  if (!scoreTable || scoreTable.length === 0) return 0;
  return scoreTable
    .map((l) => Number(l.배점))
    .filter((n) => !isNaN(n))
    .reduce((m, cur) => Math.max(m, cur), 0);
}

/**
 * 배점표에서 순수 숫자 최하점을 찾음 (F, P 등 제외)
 */
export function findMinScore(scoreTable: ScoreRow[]): number {
  if (!scoreTable || scoreTable.length === 0) return 0;

  const keywordsToIgnore = ['F', 'G', '미응시', '파울', '실격', 'P', 'PASS'];
  const allScores: number[] = [];

  for (const level of scoreTable) {
    const recordStr = String(level.기록).trim().toUpperCase();
    if (keywordsToIgnore.includes(recordStr)) continue;

    const score = Number(level.배점);
    if (!isNaN(score)) {
      allScores.push(score);
    }
  }

  return allScores.length > 0 ? Math.min(...allScores) : 0;
}

/**
 * 감수(급간 레벨) 계산
 * 만점 → 0감, 1등급 아래 → 1감, ...
 */
export function lookupDeductionLevel(studentScore: number, scoreTable: ScoreRow[]): number {
  if (!scoreTable || scoreTable.length === 0) return 0;

  const allScores = [...new Set(
    scoreTable
      .map((l) => Number(l.배점))
      .filter((n) => !isNaN(n))
  )];

  allScores.sort((a, b) => b - a); // 내림차순

  const studentScoreNum = Number(studentScore);
  if (isNaN(studentScoreNum)) return 0;

  const levelIndex = allScores.indexOf(studentScoreNum);
  return levelIndex === -1 ? 0 : levelIndex;
}

/**
 * 학생 기록으로 배점 등급 찾기
 */
export function lookupScore(
  studentRecord: string | number,
  method: 'lower_is_better' | 'higher_is_better',
  scoreTable: ScoreRow[],
  outOfRangeRule: string = '0점'
): number {
  if (!scoreTable || scoreTable.length === 0) return 0;

  const studentValueStr = String(studentRecord).trim().toUpperCase();

  // F/G/미응시 등은 최하점
  const FORCE_MIN_SCORE_KEYWORDS = ['F', 'G', '미응시', '파울', '실격'];
  if (FORCE_MIN_SCORE_KEYWORDS.includes(studentValueStr)) {
    return findMinScore(scoreTable);
  }

  const studentValueNum = Number(studentValueStr);
  const isNumericInput = !isNaN(studentValueNum) && studentValueStr !== '';

  const numericLevels: { record: number; grade: number }[] = [];
  const exactMatchLevels = new Map<string, number>();
  const rangeLevels: { rangeStr: string; grade: number }[] = [];

  for (const level of scoreTable) {
    const recordStr = String(level.기록).trim();
    const recordNum = Number(recordStr);

    if (!isNaN(recordNum) && recordStr !== '') {
      numericLevels.push({ record: recordNum, grade: level.배점 });
    } else if (
      recordStr.includes('이상') ||
      recordStr.includes('이하') ||
      recordStr.includes('초과') ||
      recordStr.includes('미만')
    ) {
      rangeLevels.push({ rangeStr: recordStr, grade: level.배점 });
    } else {
      exactMatchLevels.set(recordStr.toUpperCase(), level.배점);
    }
  }

  // 1순위: 문자(P/F 등) 일치
  if (exactMatchLevels.has(studentValueStr)) {
    return exactMatchLevels.get(studentValueStr) || 0;
  }

  if (isNumericInput) {
    // 2순위: "200 이상" 같은 범위
    for (const level of rangeLevels) {
      const parts = level.rangeStr.match(/([0-9.]+)\s*(이상|이하|초과|미만)/);
      if (parts && parts[1]) {
        const limit = Number(parts[1]);
        const type = parts[2];
        if (type === '이상' && studentValueNum >= limit) return level.grade;
        if (type === '이하' && studentValueNum <= limit) return level.grade;
        if (type === '초과' && studentValueNum > limit) return level.grade;
        if (type === '미만' && studentValueNum < limit) return level.grade;
      }
    }

    // 3순위: 단순 숫자 비교
    if (numericLevels.length > 0) {
      numericLevels.sort((a, b) => b.record - a.record);

      if (method === 'lower_is_better') {
        for (const level of numericLevels) {
          if (studentValueNum >= level.record) return level.grade;
        }
        // 모든 값보다 작으면 가장 작은 기록의 점수
        return numericLevels[numericLevels.length - 1].grade;
      } else {
        for (const level of numericLevels) {
          if (studentValueNum >= level.record) return level.grade;
        }
        // 모든 값보다 작으면 가장 작은 기록의 점수
        return numericLevels[numericLevels.length - 1].grade;
      }
    }
  }

  // 4순위: 어디에도 안 맞으면
  if (outOfRangeRule === '최하점') {
    return findMinScore(scoreTable);
  }
  return 0;
}

/**
 * 배점 등급을 최종 점수로 환산
 * P/PASS → 100, NP/N/FAIL → 0
 */
export function convertGradeToScore(grade: string | number): number {
  const g = String(grade).toUpperCase();

  if (g === 'P' || g === 'PASS') return 100;
  if (g === 'NP' || g === 'N' || g === 'FAIL') return 0;

  const score = Number(grade);
  return isNaN(score) ? 0 : score;
}

// ========== Special 모드 계산 ==========

function practicalTopN(list: EventRecord[], n: number, maxScore: number): number {
  if (!list || list.length === 0) return 0;
  const sorted = [...list].sort((a, b) => (b.score || 0) - (a.score || 0));
  const picked = sorted.slice(0, n);
  const sum = picked.reduce((s, r) => s + (r.score || 0), 0);
  return (sum / (n * 100)) * maxScore;
}

/**
 * Special 모드 대학별 계산
 */
export function calcPracticalSpecial(
  uId: number,
  list: EventRecord[],
  gender: string
): number {
  const scoreMap = new Map<string, number>();
  for (const item of list) {
    scoreMap.set(item.event, item.score || 0);
  }

  const cleaned = list.filter((it) => Number.isFinite(it.score) && (it.score || 0) > 0);
  const sumOfAllScores = Array.from(scoreMap.values()).reduce((sum, score) => sum + score, 0);
  const sumOfCleanedScores = cleaned.reduce((sum, item) => sum + (item.score || 0), 0);

  switch (uId) {
    // ID 2: 합계 구간별 환산
    case 2: {
      if (sumOfCleanedScores >= 286) return 700;
      if (sumOfCleanedScores >= 271) return 691;
      if (sumOfCleanedScores >= 256) return 682;
      if (sumOfCleanedScores >= 241) return 673;
      if (sumOfCleanedScores >= 226) return 664;
      if (sumOfCleanedScores >= 211) return 655;
      if (sumOfCleanedScores >= 196) return 646;
      if (sumOfCleanedScores >= 181) return 637;
      return 630;
    }

    // ID 3: 합계 + 1
    case 3:
      return sumOfCleanedScores + 1;

    // ID 13: 성별별 min/max 공식
    case 13: {
      if (gender !== '남' && gender !== '여') return 0;

      const standards: Record<string, Record<string, { min: number; max: number }>> = {
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
          if (record < max) cappedRecord = max;
          if (record > min) cappedRecord = min;
        } else {
          if (record > max) cappedRecord = max;
          if (record < min) cappedRecord = min;
        }

        const eventScore = max - min === 0 ? 0 : ((cappedRecord - min) / (max - min)) * 100;
        item.score = Math.round(eventScore * 100) / 100;
        totalScore += item.score;
      }

      return Math.round(totalScore * 100) / 100;
    }

    // ID 16: 가중치 합산 (9.8, 9.8, 8.4)
    case 16: {
      const runScore = scoreMap.get('10m왕복달리기') || 0;
      const jumpScore = scoreMap.get('제자리멀리뛰기') || 0;
      const situpScore = scoreMap.get('윗몸일으키기') || 0;
      return runScore * 9.8 + jumpScore * 9.8 + situpScore * 8.4;
    }

    // ID 17: 가중치 합산 (5.6, 5.6, 4.8)
    case 17: {
      const runScore = scoreMap.get('10m왕복달리기') || 0;
      const jumpScore = scoreMap.get('제자리멀리뛰기') || 0;
      const situpScore = scoreMap.get('윗몸일으키기') || 0;
      return runScore * 5.6 + jumpScore * 5.6 + situpScore * 4.8;
    }

    // ID 19: 합계 + 2
    case 19:
      return sumOfCleanedScores + 2;

    // ID 69, 70: (합계/3)×4 + 400
    case 69:
    case 70:
      return (sumOfAllScores / 3) * 4 + 400;

    // ID 71: 단순 합계
    case 71:
      return sumOfAllScores;

    // ID 99, 147: 상위 3종목, 800점 만점
    case 99:
    case 147:
      return practicalTopN(cleaned, 3, 800);

    // ID 121: (100 × PASS개수) + 200
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

    // ID 146: 상위 3종목, 400점 만점
    case 146:
      return practicalTopN(cleaned, 3, 400);

    // ID 151, 152: ((합계/3)-80)*(7/6)+560
    case 151:
    case 152:
      return ((sumOfAllScores / 3) - 80) * (7 / 6) + 560;

    // ID 153: ((합계/2)-80)+480
    case 153:
      return ((sumOfAllScores / 2) - 80) + 480;

    // ID 160: 가중치 4:3:3 → 700점
    case 160: {
      const runScore = scoreMap.get('20m왕복달리기') || 0;
      const jumpScore = scoreMap.get('제자리멀리뛰기') || 0;
      const throwScore = scoreMap.get('메디신볼던지기') || 0;
      const rawTotal = (runScore * 4) + (jumpScore * 3) + (throwScore * 3);
      return (rawTotal / 1000) * 700;
    }

    // ID 175: 합계/3
    case 175:
      return sumOfAllScores / 3;

    // ID 184: (합계/300)*280
    case 184:
      return (sumOfAllScores / 300) * 280;

    // ID 186: 합계 + 300
    case 186:
      return sumOfCleanedScores + 300;

    // ID 189, 199: 합계 + 20
    case 189:
    case 199:
      return sumOfCleanedScores + 20;

    // ID 194, 197: 합계×0.5×0.8
    case 194:
    case 197:
      return sumOfCleanedScores * 0.5 * 0.8;

    default:
      return 0;
  }
}

// ========== 메인 계산 함수 ==========

/**
 * 실기 점수 계산
 */
export function calculatePracticalScore(
  config: PracticalConfig,
  scoreTable: Record<string, ScoreRow[]>,
  studentRecords: { event: string; record: string }[],
  gender: string
): PracticalResult {
  const { practicalMode, practicalTotal, baseScore, failHandling, U_ID } = config;

  const eventBreakdowns: EventRecord[] = [];
  let totalDeduction = 0;

  // 각 종목별 점수 계산
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

  // Special 모드
  if (practicalMode === 'special') {
    const finalScore = calcPracticalSpecial(U_ID, eventBreakdowns, gender);
    return {
      totalScore: Math.round(finalScore * 1000) / 1000,
      events: eventBreakdowns,
      totalDeduction,
    };
  }

  // Basic 모드: 환산 계산
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

// Special 모드 대학 U_ID 목록
export const SPECIAL_MODE_UIDS = [
  2, 3, 13, 16, 17, 19, 69, 70, 71, 99, 121, 146, 147, 151, 152, 153, 160, 175, 184, 186, 189, 194, 197, 199
];
