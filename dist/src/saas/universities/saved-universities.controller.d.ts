import { SavedUniversitiesService } from './saved-universities.service';
export declare class SavedUniversitiesController {
    private savedUnivService;
    constructor(savedUnivService: SavedUniversitiesService);
    getSavedUniversities(req: any): Promise<{
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
    toggleSave(req: any, uId: string, body?: {
        sunung_score?: number;
    }): Promise<{
        saved: boolean;
    }>;
    updateSaved(req: any, uId: string, body: {
        naesin_score?: number;
        memo?: string;
        practical_score?: number;
        practical_records?: Array<{
            event: string;
            record: string;
            score?: number;
            deduction?: number;
        }>;
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
    isSaved(req: any, uId: string): Promise<{
        saved: boolean;
    }>;
    getPracticalScores(uId: string, year: string, gender?: string): Promise<{
        events: string[];
        scoreTable: Record<string, any[]>;
        practicalMode: string;
        practicalTotal: number;
        baseScore: number;
        failHandling: string;
        specialConfig: string | number | true | import("@prisma/client/runtime/library").JsonObject | import("@prisma/client/runtime/library").JsonArray | null;
    }>;
}
