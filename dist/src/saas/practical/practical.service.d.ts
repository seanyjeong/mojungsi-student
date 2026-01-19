import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
export declare class PracticalService {
    private prisma;
    constructor(prisma: PrismaService);
    getEventTypes(userId: number): Promise<{
        created_at: Date;
        name: string;
        id: number;
        user_id: number;
        direction: import(".prisma/client").$Enums.saas_practical_event_direction;
        unit: string | null;
        display_order: number;
        is_default: boolean;
    }[]>;
    initDefaultEventTypes(userId: number): Promise<{
        message: string;
    }>;
    createEventType(userId: number, data: {
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
    updateEventType(id: number, userId: number, data: {
        name?: string;
        direction?: 'lower' | 'higher';
        unit?: string;
        display_order?: number;
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
    deleteEventType(id: number, userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getRecords(userId: number): Promise<{
        created_at: Date;
        updated_at: Date;
        id: number;
        event_name: string;
        record: string | null;
        user_id: number;
        memo: string | null;
        numeric_record: Decimal | null;
        record_date: Date | null;
    }[]>;
    getRecordsByEvent(userId: number, eventName: string): Promise<{
        created_at: Date;
        updated_at: Date;
        id: number;
        event_name: string;
        record: string | null;
        user_id: number;
        memo: string | null;
        numeric_record: Decimal | null;
        record_date: Date | null;
    }[]>;
    getHistory(userId: number, eventName: string): Promise<{
        records: {
            id: number;
            record: string | null;
            memo: string | null;
            numeric_record: Decimal | null;
            record_date: Date | null;
        }[];
        eventType: null;
        stats: null;
    } | {
        records: {
            id: number;
            record: string | null;
            memo: string | null;
            numeric_record: Decimal | null;
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
    createRecord(userId: number, data: {
        event_name: string;
        record?: string;
        record_date?: Date;
        memo?: string;
    }): Promise<{
        created_at: Date;
        updated_at: Date;
        id: number;
        event_name: string;
        record: string | null;
        user_id: number;
        memo: string | null;
        numeric_record: Decimal | null;
        record_date: Date | null;
    }>;
    updateRecord(id: number, userId: number, data: {
        record?: string;
        record_date?: Date;
        memo?: string;
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
    deleteRecord(id: number, userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    private parseRecordToNumber;
}
