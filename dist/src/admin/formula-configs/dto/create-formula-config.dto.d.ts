export declare class CreateFormulaConfigDto {
    deptId: number;
    totalScore?: number;
    suneungRatio?: number;
    silgiTotal?: number;
    subjectsConfig?: any;
    selectionRules?: any;
    bonusRules?: any;
    englishScores?: Record<string, number>;
    historyScores?: Record<string, number>;
    calculationMode?: string;
    legacyFormula?: string;
    legacyUid?: number;
    displayConfig?: any;
}
