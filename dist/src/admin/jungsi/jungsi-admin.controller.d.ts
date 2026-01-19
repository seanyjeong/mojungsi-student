import { JungsiAdminService } from './jungsi-admin.service';
declare class SubjectRatiosDto {
    국어?: number;
    수학?: number;
    영어?: number;
    탐구?: number;
    탐구수?: number;
}
declare class SelectionRuleDto {
    type: 'select_n' | 'select_ranked_weights';
    from: string[];
    count?: number;
    weights?: number[];
}
declare class HighestScoreDto {
    subject_name: string;
    max_score: number;
}
declare class BulkHighestScoresDto {
    scores: HighestScoreDto[];
}
declare class InquiryConvDto {
    track: '사탐' | '과탐';
    scores: Record<number, number>;
}
declare class PracticalScoreDto {
    event_name: string;
    gender?: string;
    record?: string;
    score: number;
}
declare class CopyYearDto {
    fromYear: number;
    toYear: number;
}
export declare class JungsiAdminController {
    private readonly adminService;
    constructor(adminService: JungsiAdminService);
    getBasicList(year: number): Promise<{
        success: boolean;
        count: number;
        list: {
            U_ID: number;
            대학명: string;
            학과명: string;
            군: string | null;
            형태: string | null;
            광역: string | null;
            시구: string | null;
            모집정원: string | null;
            교직: string | null;
            단계별: string | null;
            updated_at: Date | null;
        }[];
    }>;
    getBasicById(U_ID: number): Promise<{
        success: boolean;
        data: {
            U_ID: number;
            year: number;
            gun: string | null;
            type: string | null;
            region: string | null;
            city: string | null;
            admission: string | null;
            univ_name: string;
            dept_name: string;
            quota: string | null;
            logo_url: string | null;
            teacher_cert: string | null;
            step_type: string | null;
            updated_at: Date | null;
        };
    }>;
    updateBasic(U_ID: number, data: any): Promise<{
        success: boolean;
        data: {
            U_ID: number;
            year: number;
            gun: string | null;
            type: string | null;
            region: string | null;
            city: string | null;
            admission: string | null;
            univ_name: string;
            dept_name: string;
            quota: string | null;
            logo_url: string | null;
            teacher_cert: string | null;
            step_type: string | null;
            updated_at: Date | null;
        };
    }>;
    getRatio(U_ID: number): Promise<{
        success: boolean;
        data: {
            U_ID: number;
            학년도: number;
            총점: number | null;
            수능비율: number | null;
            실기비율: number | null;
            실기총점: number | null;
            국어: number;
            수학: number;
            영어: number;
            탐구: number;
            탐구수: number;
            영어등급배점: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
            한국사등급배점: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
            선택반영규칙: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
            가산점규칙: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
            특수공식: string | null;
            score_config: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
            updated_at: Date | null;
        };
    }>;
    updateSubjectRatios(U_ID: number, data: SubjectRatiosDto): Promise<{
        success: boolean;
        message: string;
    }>;
    updateEnglishScores(U_ID: number, scores: Record<string, number>): Promise<{
        success: boolean;
        message: string;
    }>;
    updateHistoryScores(U_ID: number, scores: Record<string, number>): Promise<{
        success: boolean;
        message: string;
    }>;
    updateSelectionRules(U_ID: number, rules: SelectionRuleDto[]): Promise<{
        success: boolean;
        message: string;
    }>;
    updateSpecialFormula(U_ID: number, formula: string | null): Promise<{
        success: boolean;
        message: string;
    }>;
    updateBonusRules(U_ID: number, rules: any[]): Promise<{
        success: boolean;
        message: string;
    }>;
    updateScoreConfig(U_ID: number, config: any): Promise<{
        success: boolean;
        message: string;
    }>;
    updateCalcMethod(U_ID: number, data: {
        calc_type?: string;
        calc_method?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    updateTotalScore(U_ID: number, totalScore: number): Promise<{
        success: boolean;
        message: string;
    }>;
    updateEtcSettings(U_ID: number, settings: any): Promise<{
        success: boolean;
        message: string;
    }>;
    updateEtcNote(U_ID: number, note: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateMainRatios(U_ID: number, data: {
        suneung?: string;
        naesin?: string;
        practical?: string;
        practical_total?: number;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    bulkUpdate(body: {
        year: number;
        data: Array<{
            U_ID: number;
            univ_name?: string;
            dept_name?: string;
            gun?: string;
            quota?: string;
            suneung?: string;
            naesin?: string;
            practical?: string;
            korean?: number;
            math?: number;
            english?: number;
            inquiry?: number;
            inquiry_count?: number;
            english_scores?: Record<string, number>;
            history_scores?: Record<string, number>;
        }>;
    }): Promise<{
        updated: number;
        failed: number;
        errors: string[];
        success: boolean;
        message: string;
    }>;
    exportAll(year: number): Promise<{
        success: boolean;
        year: number;
        data: {
            U_ID: number;
            대학명: string;
            학과명: string;
            군: string | null;
            형태: string | null;
            모집정원: string | null;
            수능비율: any;
            내신비율: any;
            실기비율: any;
            총점: any;
            국어: number;
            수학: number;
            영어: number;
            탐구: number;
            탐구수: any;
            영1: any;
            영2: any;
            영3: any;
            영4: any;
            영5: any;
            영6: any;
            영7: any;
            영8: any;
            영9: any;
            한1: any;
            한2: any;
            한3: any;
            한4: any;
            한5: any;
            한6: any;
            한7: any;
            한8: any;
            한9: any;
        }[];
    }>;
    getHighestScores(year: number, mohyung?: string): Promise<{
        success: boolean;
        year: number;
        mohyung: string;
        scores: {
            id: number;
            과목명: string;
            최고점: number;
        }[];
    }>;
    bulkUpdateHighestScores(year: number, mohyung: string | undefined, body: BulkHighestScoresDto): Promise<{
        success: boolean;
        message: string;
        count: number;
    }>;
    getInquiryConv(U_ID: number, year: number): Promise<{
        success: boolean;
        data: {
            U_ID: number;
            year: number;
            사탐: Record<number, number>;
            과탐: Record<number, number>;
        };
    }>;
    updateInquiryConv(U_ID: number, year: number, body: InquiryConvDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getPracticalScores(U_ID: number, year: number): Promise<{
        success: boolean;
        data: Record<string, any[]>;
    }>;
    addPracticalScore(U_ID: number, year: number, body: PracticalScoreDto): Promise<{
        success: boolean;
        data: {
            U_ID: number;
            year: number;
            id: number;
            event_name: string;
            gender: string | null;
            record: string | null;
            score: import("@prisma/client/runtime/library").Decimal | null;
        };
    }>;
    updatePracticalScore(id: number, body: Partial<PracticalScoreDto>): Promise<{
        success: boolean;
        data: {
            U_ID: number;
            year: number;
            id: number;
            event_name: string;
            gender: string | null;
            record: string | null;
            score: import("@prisma/client/runtime/library").Decimal | null;
        };
    }>;
    deletePracticalScore(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getFullDetails(U_ID: number, year: number): Promise<{
        success: boolean;
        data: {
            기본정보: {
                U_ID: number;
                대학명: string;
                학과명: string;
                군: string | null;
                형태: string | null;
                모집정원: string | null;
            };
            반영비율: {
                U_ID: number;
                학년도: number;
                총점: number | null;
                수능비율: number | null;
                실기비율: number | null;
                실기총점: number | null;
                국어: number;
                수학: number;
                영어: number;
                탐구: number;
                탐구수: number;
                영어등급배점: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
                한국사등급배점: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
                선택반영규칙: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
                가산점규칙: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
                특수공식: string | null;
                score_config: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray;
                updated_at: Date | null;
            };
            변환표준점수: {
                U_ID: number;
                year: number;
                사탐: Record<number, number>;
                과탐: Record<number, number>;
            };
            실기배점: Record<string, any[]>;
        };
    }>;
    copyYearData(body: CopyYearDto): Promise<{
        message: string;
        copiedCount: {
            basic: number;
            ratio: number;
            conv: number;
            practical: number;
        };
        uidMap: Record<number, number>;
        success: boolean;
    }>;
}
export {};
