export declare class StudentScoreDto {
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
export declare class CalculateSingleRequestDto {
    deptId: number;
    student: StudentScoreDto;
}
export declare class CalculateBatchRequestDto {
    deptIds: number[];
    student: StudentScoreDto;
}
export declare class FrontendScoreItemDto {
    subject?: string;
    std?: number;
    pct?: number;
    grade?: number;
}
export declare class FrontendGradeOnlyDto {
    grade: number;
}
export declare class FrontendScoresDto {
    korean: FrontendScoreItemDto;
    math: FrontendScoreItemDto;
    english: FrontendGradeOnlyDto;
    history: FrontendGradeOnlyDto;
    inquiry1: FrontendScoreItemDto;
    inquiry2: FrontendScoreItemDto;
}
export declare class CalculateAllRequestDto {
    year: number;
    scores: FrontendScoresDto;
}
export declare class CalculationBreakdownDto {
    baseScore: number;
    selectScore: number;
    englishBonus: number;
    historyBonus: number;
    suneungRatio: number;
    rawTotal: number;
}
export declare class CalculationResultDto {
    finalScore: number;
    breakdown: CalculationBreakdownDto;
    debug?: Record<string, unknown>;
}
export declare class CalculateSingleResponseDto {
    universityName: string;
    departmentName: string;
    result: CalculationResultDto;
}
export declare class CalculateBatchResponseDto {
    results: CalculateSingleResponseDto[];
    successCount: number;
    totalCount: number;
}
