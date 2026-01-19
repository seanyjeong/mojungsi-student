import { ScoresService } from './scores.service';
export declare class ScoresController {
    private scoresService;
    constructor(scoresService: ScoresService);
    getScores(req: any, year?: string): Promise<{
        created_at: Date;
        year: number;
        updated_at: Date;
        id: number;
        user_id: number;
        exam_type: string;
        scores: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getScoreByExamType(req: any, examType: string, year?: string): Promise<{
        created_at: Date;
        year: number;
        updated_at: Date;
        id: number;
        user_id: number;
        exam_type: string;
        scores: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
    saveScore(req: any, body: {
        examType: string;
        scores: any;
        year?: number;
    }): Promise<{
        created_at: Date;
        year: number;
        updated_at: Date;
        id: number;
        user_id: number;
        exam_type: string;
        scores: import("@prisma/client/runtime/library").JsonValue;
    }>;
    deleteScore(req: any, examType: string, year?: string): Promise<{
        created_at: Date;
        year: number;
        updated_at: Date;
        id: number;
        user_id: number;
        exam_type: string;
        scores: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
