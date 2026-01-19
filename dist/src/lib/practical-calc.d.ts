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
export declare function getEventRules(eventName: string): {
    method: 'lower_is_better' | 'higher_is_better';
};
export declare function findMaxScore(scoreTable: ScoreRow[]): number;
export declare function findMinScore(scoreTable: ScoreRow[]): number;
export declare function lookupDeductionLevel(studentScore: number, scoreTable: ScoreRow[]): number;
export declare function lookupScore(studentRecord: string | number, method: 'lower_is_better' | 'higher_is_better', scoreTable: ScoreRow[], outOfRangeRule?: string): number;
export declare function convertGradeToScore(grade: string | number): number;
export declare function calcPracticalSpecial(uId: number, list: EventRecord[], gender: string): number;
export declare function calculatePracticalScore(config: PracticalConfig, scoreTable: Record<string, ScoreRow[]>, studentRecords: {
    event: string;
    record: string;
}[], gender: string): PracticalResult;
export declare const SPECIAL_MODE_UIDS: number[];
