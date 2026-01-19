export interface ScoreForm {
    korean: {
        subject: string;
        std: number;
        pct: number;
        grade: number;
    };
    math: {
        subject: string;
        std: number;
        pct: number;
        grade: number;
    };
    english: {
        grade: number;
    };
    history: {
        grade: number;
    };
    inquiry1: {
        subject: string;
        std: number;
        pct: number;
        grade: number;
    };
    inquiry2: {
        subject: string;
        std: number;
        pct: number;
        grade: number;
    };
}
export interface SingleCalculationResult {
    success: boolean;
    universityName: string;
    departmentName: string;
    result: {
        totalScore: string;
        breakdown?: {
            base?: number;
            select?: number;
            history?: number;
            english_bonus?: number;
        };
        calculationLog?: string[];
    };
}
export interface CalculationResult {
    finalScore: number;
    breakdown: {
        korean: number;
        math: number;
        english: number;
        inquiry: number;
        history: number;
    };
    scoreInfo: {
        totalScore: number;
        suneungMaxScore: number;
        silgiMaxScore: number;
    };
    university?: UniversityInfo;
}
export interface UniversityInfo {
    id: number;
    univId: number;
    univName: string;
    deptName: string;
    yearId: number;
    mojipgun: "가" | "나" | "다";
    mojipInwon: number;
    region?: string;
}
export interface BatchCalculationResult extends CalculationResult {
    university: UniversityInfo;
    deptId: number;
}
export declare const KOREAN_SUBJECTS: readonly [{
    readonly value: "화법과작문";
    readonly label: "화법과작문";
}, {
    readonly value: "언어와매체";
    readonly label: "언어와매체";
}];
export declare const MATH_SUBJECTS: readonly [{
    readonly value: "확률과통계";
    readonly label: "확률과통계";
}, {
    readonly value: "미적분";
    readonly label: "미적분";
}, {
    readonly value: "기하";
    readonly label: "기하";
}];
export declare const GRADES: {
    value: string;
    label: string;
}[];
