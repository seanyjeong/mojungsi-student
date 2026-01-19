import { ScoreForm, SingleCalculationResult, BatchCalculationResult } from "@/types";
export declare function calculateScore(U_ID: number, scores: ScoreForm, year?: number): Promise<SingleCalculationResult>;
export declare function calculateBatch(scores: ScoreForm, yearId?: number): Promise<BatchCalculationResult[]>;
export declare function calculateAll(scores: ScoreForm, year?: number): Promise<{
    success: boolean;
    results: Array<{
        U_ID: number;
        환산점수: number;
    }>;
    count: number;
}>;
export declare function getUniversities(yearId?: number): Promise<any>;
export declare function getUniversityDetail(id: number): Promise<any>;
export declare function getKakaoLoginUrl(): Promise<{
    url: string;
}>;
export declare function kakaoCallback(code: string): Promise<{
    accessToken: string;
    user: {
        id: number;
        nickname: string;
        email: string | null;
        profileImage: string | null;
    };
}>;
export declare function getMe(token: string): Promise<any>;
export declare function getProfile(token: string): Promise<any>;
export declare function updateProfile(token: string, data: {
    name?: string;
    school?: string;
    grade?: string;
    gender?: string;
}): Promise<any>;
export declare function getScores(token: string, year?: number): Promise<any>;
export declare function getScoreByExamType(token: string, examType: string, year?: number): Promise<any>;
export declare function saveScore(token: string, examType: string, scores: any, year?: number): Promise<any>;
export declare function getSavedUniversities(token: string): Promise<any>;
export declare function toggleSaveUniversity(token: string, uId: number, sunungScore?: number): Promise<any>;
export declare function updateSavedUniversity(token: string, uId: number, data: {
    naesin_score?: number;
    memo?: string;
    practical_score?: number;
    practical_records?: Array<{
        event: string;
        record: string;
        score?: number;
        deduction?: number;
    }>;
}): Promise<any>;
export declare function getPracticalScoreTable(token: string, uId: number, year?: number, gender?: string): Promise<any>;
export declare function checkIsSaved(token: string, uId: number): Promise<any>;
export declare function getPracticalRecords(token: string, event?: string): Promise<any>;
export declare function createPracticalRecord(token: string, data: {
    event_name: string;
    record?: string;
    record_date?: string;
    memo?: string;
}): Promise<any>;
export declare function updatePracticalRecord(token: string, id: number, data: {
    record?: string;
    record_date?: string;
    memo?: string;
}): Promise<any>;
export declare function deletePracticalRecord(token: string, id: number): Promise<any>;
export declare function withdrawUser(token: string): Promise<any>;
