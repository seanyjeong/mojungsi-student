import { StudentScore, FormulaConfig, SubjectName, NormScores, MaxScores, CalculationResult } from './types';
export declare abstract class BaseCalculator {
    protected formula: FormulaConfig;
    protected student: StudentScore;
    protected debug: Record<string, unknown>;
    constructor(formula: FormulaConfig, student: StudentScore);
    abstract calculate(): CalculationResult;
    protected safeParse<T>(json: string | T | null | undefined, fallback: T): T;
    protected resolveTotal(): number;
    protected resolveSuneungRatio(): number;
    protected resolveSilgiTotal(): number;
    protected resolveSuneungMaxScore(): number;
    protected resolveMaxScores(): MaxScores;
    protected getRatio(subject: SubjectName): number;
    protected calcInquiryRepresentative(): number;
    protected guessInquiryGroup(subject?: string): 'social' | 'science' | 'unknown';
    protected normalizeSubjectName(name: string): SubjectName | null;
    protected mapPercentileToConverted(percentile: number, track?: 'social' | 'science'): number;
    protected detectEnglishAsBonus(): boolean;
    protected detectHistoryAsBonus(): boolean;
    protected getEnglishScore(grade: number): number;
    protected getEnglishEstimatedPercentile(grade: number): number;
    protected getHistoryScore(grade: number): number;
    protected getRawScore(subject: SubjectName): number;
    protected normOf(subject: SubjectName, maxScores: MaxScores): number;
    protected calculateAllNorms(): NormScores;
    protected getMathBonusMultiplier(): number;
    protected addDebug(key: string, value: unknown): void;
}
