export interface ProductionFormulaData {
    U_ID?: number;
    국어: number;
    수학: number;
    영어: number;
    탐구: number;
    한국사: number;
    총점: number;
    수능: number;
    탐구수: number;
    계산유형?: string;
    특수공식?: string;
    score_config?: ScoreConfig;
    selection_rules?: SelectionRule[] | SelectionRule | null;
    bonus_rules?: BonusRule[] | null;
    english_scores?: Record<string, number> | null;
    history_scores?: Record<string, number> | null;
    english_bonus_scores?: Record<string, number> | null;
    english_bonus_fixed?: number;
    기타설정?: OtherSettings;
    탐구변표?: {
        사탐: Record<string, number>;
        과탐: Record<string, number>;
    };
    영어처리?: string;
    영어비고?: string;
}
export interface ScoreConfig {
    korean_math?: {
        type: '표준점수' | '백분위';
        max_score_method?: 'fixed_200' | 'highest_of_year';
    };
    inquiry?: {
        type: '표준점수' | '백분위' | '변환표준점수';
        max_score_method?: 'fixed_100' | 'highest_of_year';
    };
    english?: {
        type?: 'fixed_max_score';
        max_score?: number;
    };
    math_bonus_cap_100?: boolean;
}
export interface SelectionRule {
    type: 'select_n' | 'select_ranked_weights';
    from: string[];
    count?: number;
    weights?: number[];
}
export interface BonusRule {
    type: 'percent_bonus';
    subjects: string[];
    value: number;
}
export interface OtherSettings {
    한국사우선적용?: boolean;
}
export interface StudentSubject {
    name: string;
    subject?: string;
    std?: number;
    percentile?: number;
    grade?: number;
    group?: string;
    type?: string;
    converted_std?: number;
    vstd?: number;
    conv_std?: number;
}
export interface ProductionStudentScores {
    subjects: StudentSubject[];
}
export interface HighestMap {
    [subjectName: string]: number;
}
export interface CalculationResult {
    totalScore: string;
    breakdown: Record<string, number>;
    calculationLog: string[];
}
export declare function safeParse<T>(v: unknown, fb: T): T;
export declare function guessInquiryGroup(subjectName?: string): '사탐' | '과탐';
export declare function calculateScore(formulaDataRaw: ProductionFormulaData, studentScores: ProductionStudentScores, highestMap: HighestMap | null): CalculationResult;
export declare function calculateScoreWithConv(formulaDataRaw: ProductionFormulaData, studentScores: ProductionStudentScores, convMap: {
    사탐: Record<string, number>;
    과탐: Record<string, number>;
} | null, logHook: ((msg: string) => void) | null, highestMap: HighestMap | null): CalculationResult;
