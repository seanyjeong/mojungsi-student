import { PrismaService } from '../../prisma/prisma.service';
interface PracticalRecord {
    event: string;
    record: string;
    score?: number;
    deduction?: number;
}
export declare class SavedUniversitiesService {
    private prisma;
    constructor(prisma: PrismaService);
    getSavedUniversities(userId: number): Promise<{
        university: {
            U_NM: string;
            D_NM: string;
            지역: string;
            모집인원: number;
            모집군: string;
            실기종목: string;
            수능반영비율: number;
            내신반영비율: number;
            실기반영비율: number;
            isWomensUniv: boolean;
        } | null;
        created_at: Date;
        U_ID: number;
        updated_at: Date;
        id: number;
        practical_records: import("@prisma/client/runtime/library").JsonValue | null;
        user_id: number;
        sunung_score: import("@prisma/client/runtime/library").Decimal | null;
        naesin_score: import("@prisma/client/runtime/library").Decimal | null;
        practical_score: import("@prisma/client/runtime/library").Decimal | null;
        memo: string | null;
    }[]>;
    toggleSave(userId: number, uId: number, sunungScore?: number): Promise<{
        saved: boolean;
    }>;
    updateSavedUniversity(userId: number, uId: number, data: {
        naesin_score?: number;
        memo?: string;
        practical_score?: number;
        practical_records?: PracticalRecord[];
    }): Promise<{
        created_at: Date;
        U_ID: number;
        updated_at: Date;
        id: number;
        practical_records: import("@prisma/client/runtime/library").JsonValue | null;
        user_id: number;
        sunung_score: import("@prisma/client/runtime/library").Decimal | null;
        naesin_score: import("@prisma/client/runtime/library").Decimal | null;
        practical_score: import("@prisma/client/runtime/library").Decimal | null;
        memo: string | null;
    }>;
    getPracticalScoreTable(uId: number, year: number, gender?: string): Promise<{
        events: string[];
        scoreTable: Record<string, any[]>;
        practicalMode: string;
        practicalTotal: number;
        baseScore: number;
        failHandling: string;
        specialConfig: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray | null;
    }>;
    isSaved(userId: number, uId: number): Promise<boolean>;
}
export {};
