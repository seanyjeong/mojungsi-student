import { PracticalService } from './practical.service';
export declare class PracticalController {
    private practicalService;
    constructor(practicalService: PracticalService);
    getEventTypes(req: any): Promise<{
        created_at: Date;
        name: string;
        id: number;
        user_id: number;
        direction: import(".prisma/client").$Enums.saas_practical_event_direction;
        unit: string | null;
        display_order: number;
        is_default: boolean;
    }[]>;
    createEventType(req: any, body: {
        name: string;
        direction: 'lower' | 'higher';
        unit?: string;
    }): Promise<{
        created_at: Date;
        name: string;
        id: number;
        user_id: number;
        direction: import(".prisma/client").$Enums.saas_practical_event_direction;
        unit: string | null;
        display_order: number;
        is_default: boolean;
    }>;
    updateEventType(req: any, id: string, body: {
        name?: string;
        direction?: 'lower' | 'higher';
        unit?: string;
        display_order?: number;
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
    deleteEventType(req: any, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    initEventTypes(req: any): Promise<{
        message: string;
    }>;
    getRecords(req: any, event?: string): Promise<{
        created_at: Date;
        updated_at: Date;
        id: number;
        event_name: string;
        record: string | null;
        user_id: number;
        memo: string | null;
        numeric_record: import("@prisma/client/runtime/library").Decimal | null;
        record_date: Date | null;
    }[]>;
    getHistory(req: any, eventName: string): Promise<{
        records: {
            id: number;
            record: string | null;
            memo: string | null;
            numeric_record: import("@prisma/client/runtime/library").Decimal | null;
            record_date: Date | null;
        }[];
        eventType: null;
        stats: null;
    } | {
        records: {
            id: number;
            record: string | null;
            memo: string | null;
            numeric_record: import("@prisma/client/runtime/library").Decimal | null;
            record_date: Date | null;
        }[];
        eventType: {
            created_at: Date;
            name: string;
            id: number;
            user_id: number;
            direction: import(".prisma/client").$Enums.saas_practical_event_direction;
            unit: string | null;
            display_order: number;
            is_default: boolean;
        };
        stats: {
            average: number;
            pb: number;
            current: number;
            count: number;
        } | null;
    }>;
    createRecord(req: any, body: {
        event_name: string;
        record?: string;
        record_date?: string;
        memo?: string;
    }): Promise<{
        created_at: Date;
        updated_at: Date;
        id: number;
        event_name: string;
        record: string | null;
        user_id: number;
        memo: string | null;
        numeric_record: import("@prisma/client/runtime/library").Decimal | null;
        record_date: Date | null;
    }>;
    updateRecord(req: any, id: string, body: {
        record?: string;
        record_date?: string;
        memo?: string;
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
    deleteRecord(req: any, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
