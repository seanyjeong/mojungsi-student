import { PrismaService } from '../prisma/prisma.service';
declare function detectEnglishAsBonus(F: any): boolean;
declare function isSubjectUsedInRules(name: string, rulesArr: any): boolean;
declare function calcInquiryRepresentative(inquiryRows: any[], type: string, inquiryCount: number): {
    rep: number;
    sorted: {
        row: any;
        subject: any;
        val: number;
    }[];
    picked: {
        row: any;
        subject: any;
        val: number;
    }[];
};
declare function resolveMaxScores(scoreConfig: any, englishScores: any, highestMap: any, S: any): {
    korMax: number;
    mathMax: number;
    engMax: number;
    inqMax: number;
};
declare function evaluateSpecialFormula(formulaText: string, ctx: any, log: string[]): number;
declare function guessInquiryGroup(subjectName?: string): string;
declare function mapPercentileToConverted(mapObj: any, pct: number): number | null;
declare function buildSpecialContext(F: any, S: any, highestMap: any): any;
declare function calculateScore(formulaDataRaw: any, studentScores: any, highestMap: any): {
    totalScore: any;
    breakdown: {
        top2: any;
        history: number;
        special?: undefined;
        base?: undefined;
        select?: undefined;
        english_bonus?: undefined;
    };
    calculationLog: string[];
} | {
    totalScore: any;
    breakdown: {
        special: any;
        top2?: undefined;
        history?: undefined;
        base?: undefined;
        select?: undefined;
        english_bonus?: undefined;
    };
    calculationLog: string[];
} | {
    totalScore: string;
    breakdown: {
        base: number;
        select: number;
        history: number;
        english_bonus: number;
        top2?: undefined;
        special?: undefined;
    };
    calculationLog: string[];
};
declare function calculateScoreWithConv(formulaDataRaw: any, studentScores: any, convMap: any, logHook: any, highestMap: any): {
    totalScore: any;
    breakdown: {
        top2: any;
        history: number;
        special?: undefined;
        base?: undefined;
        select?: undefined;
        english_bonus?: undefined;
    };
    calculationLog: string[];
} | {
    totalScore: any;
    breakdown: {
        special: any;
        top2?: undefined;
        history?: undefined;
        base?: undefined;
        select?: undefined;
        english_bonus?: undefined;
    };
    calculationLog: string[];
} | {
    totalScore: string;
    breakdown: {
        base: number;
        select: number;
        history: number;
        english_bonus: number;
        top2?: undefined;
        special?: undefined;
    };
    calculationLog: string[];
};
export interface JungsiStudentScore {
    subjects: Array<{
        name: string;
        subject?: string;
        std?: number;
        percentile?: number;
        grade?: number;
        group?: string;
    }>;
}
export interface CalculateRequest {
    U_ID: number;
    year: number;
    studentScores: JungsiStudentScore;
    basis_exam?: string;
}
export interface CalculateResponse {
    universityName: string;
    departmentName: string;
    result: any;
}
export declare class CalculatorsService {
    private prisma;
    constructor(prisma: PrismaService);
    calculateScore(request: CalculateRequest): Promise<CalculateResponse>;
    calculateBatch(uids: number[], year: number, studentScores: JungsiStudentScore): Promise<CalculateResponse[]>;
    calculateAll(year: number, studentScores: JungsiStudentScore): Promise<any[]>;
    getUniversityList(year: number): Promise<any[]>;
    getFormulaDetails(U_ID: number, year: number): Promise<any>;
    private buildFormulaData;
    private loadHighestMap;
    private toNumber;
}
export declare const helpers: {
    calculateScoreWithConv: typeof calculateScoreWithConv;
    calculateScore: typeof calculateScore;
    safeParse: (v: any, fb?: any) => any;
    buildSpecialContext: typeof buildSpecialContext;
    pickByType: (row: any, type: string) => number;
    kmSubjectNameForKorean: (row: any) => any;
    kmSubjectNameForMath: (row: any) => any;
    inquirySubjectName: (row: any) => any;
    resolveTotal: (F: any) => number;
    detectEnglishAsBonus: typeof detectEnglishAsBonus;
    isSubjectUsedInRules: typeof isSubjectUsedInRules;
    calcInquiryRepresentative: typeof calcInquiryRepresentative;
    resolveMaxScores: typeof resolveMaxScores;
    evaluateSpecialFormula: typeof evaluateSpecialFormula;
    readConvertedStd: (t: any) => number;
    mapPercentileToConverted: typeof mapPercentileToConverted;
    guessInquiryGroup: typeof guessInquiryGroup;
};
export {};
