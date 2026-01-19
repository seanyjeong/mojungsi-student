export interface StudentScore {
    koreanSubject?: string;
    koreanStd?: number;
    koreanPercentile?: number;
    koreanGrade?: number;
    mathSubject?: string;
    mathStd?: number;
    mathPercentile?: number;
    mathGrade?: number;
    englishGrade: number;
    historyGrade: number;
    inquiry1Subject?: string;
    inquiry1Std?: number;
    inquiry1Percentile?: number;
    inquiry1Grade?: number;
    inquiry2Subject?: string;
    inquiry2Std?: number;
    inquiry2Percentile?: number;
    inquiry2Grade?: number;
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
export interface ScoreConfig {
    english_mode?: 'bonus' | 'subject';
    korean_math?: {
        type: '표준점수' | '백분위';
        max_score_method?: 'fixed_200' | 'highest_of_year';
    };
    inquiry?: {
        type: '표준점수' | '백분위' | '변환표준점수';
        max_score_method?: 'fixed_100' | 'highest_of_year';
    };
    inquiry_count?: number;
    english_scores?: Record<string, number>;
    history_scores?: Record<string, number>;
}
export interface SubjectsConfig {
    korean?: {
        ratio: number;
        source_type: 'std' | 'pct' | 'grade_conv';
    };
    math?: {
        ratio: number;
        source_type: 'std' | 'pct' | 'grade_conv';
    };
    english?: {
        ratio: number;
        source_type: 'std' | 'pct' | 'grade_conv';
    };
    inquiry?: {
        ratio: number;
        source_type: 'std' | 'pct' | 'grade_conv' | 'converted_std';
        count?: number;
    };
    history?: {
        ratio: number;
        mode?: 'bonus' | 'subject';
    };
}
export interface FormulaConfig {
    configId: number;
    deptId: number;
    totalScore: number;
    suneungRatio: number;
    silgiTotal?: number;
    subjectsConfig: SubjectsConfig;
    selectionRules?: SelectionRule[] | null;
    bonusRules?: BonusRule[] | null;
    englishScores?: Record<string, number> | null;
    historyScores?: Record<string, number> | null;
    englishBonusScores?: Record<string, number> | null;
    englishBonusFixed?: number;
    inquiryConvTable?: {
        social?: Record<number, number>;
        science?: Record<number, number>;
    };
    calculationMode?: 'legacy' | 'template';
    legacyFormula?: string | null;
    legacyUid?: number;
    university?: {
        univId: number;
        univName: string;
        deptName?: string;
    };
}
export interface CalculationResult {
    finalScore: number;
    breakdown: {
        baseScore: number;
        selectScore: number;
        englishBonus: number;
        historyBonus: number;
        suneungRatio: number;
        rawTotal: number;
    };
    scoreInfo: {
        totalScore: number;
        suneungMaxScore: number;
        silgiMaxScore: number;
    };
    debug?: Record<string, unknown>;
}
export type SubjectName = '국어' | '수학' | '영어' | '탐구' | '한국사';
export interface NormScores {
    국어: number;
    수학: number;
    영어: number;
    탐구: number;
    한국사: number;
}
export interface MaxScores {
    국어: number;
    수학: number;
    영어: number;
    탐구: number;
    한국사: number;
}
export declare const PERCENTILE_TO_CONVERTED: Record<number, number>;
export declare const ENGLISH_GRADE_TO_PERCENTILE: Record<number, number>;
export declare const SOCIAL_INQUIRY_SUBJECTS: string[];
export declare const SCIENCE_INQUIRY_SUBJECTS: string[];
