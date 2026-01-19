import { PrismaService } from '../../prisma/prisma.service';
export declare class ScoresService {
    private prisma;
    constructor(prisma: PrismaService);
    getScores(userId: number, year?: number): Promise<{
        created_at: Date;
        year: number;
        updated_at: Date;
        id: number;
        user_id: number;
        exam_type: string;
        scores: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getScoreByExamType(userId: number, examType: string, year?: number): Promise<{
        created_at: Date;
        year: number;
        updated_at: Date;
        id: number;
        user_id: number;
        exam_type: string;
        scores: import("@prisma/client/runtime/library").JsonValue;
    } | null>;
    upsertScore(userId: number, examType: string, scores: any, year?: number): Promise<{
        created_at: Date;
        year: number;
        updated_at: Date;
        id: number;
        user_id: number;
        exam_type: string;
        scores: import("@prisma/client/runtime/library").JsonValue;
    }>;
    deleteScore(userId: number, examType: string, year?: number): Promise<{
        created_at: Date;
        year: number;
        updated_at: Date;
        id: number;
        user_id: number;
        exam_type: string;
        scores: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
