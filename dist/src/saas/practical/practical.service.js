"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PracticalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
const DEFAULT_EVENT_TYPES = [
    { name: '10m버튼', direction: 'lower', unit: '초', display_order: 1 },
    { name: '10m콘', direction: 'lower', unit: '초', display_order: 2 },
    { name: '20m버튼', direction: 'lower', unit: '초', display_order: 3 },
    { name: '20m콘', direction: 'lower', unit: '초', display_order: 4 },
    { name: '제멀', direction: 'higher', unit: 'cm', display_order: 5 },
    { name: '메던', direction: 'higher', unit: 'm', display_order: 6 },
    { name: '좌전굴', direction: 'higher', unit: 'cm', display_order: 7 },
    { name: '윗몸', direction: 'higher', unit: '회', display_order: 8 },
];
let PracticalService = class PracticalService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEventTypes(userId) {
        const types = await this.prisma.saas_practical_event_types.findMany({
            where: { user_id: userId },
            orderBy: { display_order: 'asc' },
        });
        if (types.length === 0) {
            await this.initDefaultEventTypes(userId);
            return this.prisma.saas_practical_event_types.findMany({
                where: { user_id: userId },
                orderBy: { display_order: 'asc' },
            });
        }
        return types;
    }
    async initDefaultEventTypes(userId) {
        const existing = await this.prisma.saas_practical_event_types.findFirst({
            where: { user_id: userId },
        });
        if (existing)
            return { message: '이미 종목이 있습니다' };
        await this.prisma.saas_practical_event_types.createMany({
            data: DEFAULT_EVENT_TYPES.map((t) => ({
                user_id: userId,
                name: t.name,
                direction: t.direction,
                unit: t.unit,
                display_order: t.display_order,
                is_default: true,
            })),
        });
        return { message: '기본 종목 초기화 완료' };
    }
    async createEventType(userId, data) {
        const maxOrder = await this.prisma.saas_practical_event_types.aggregate({
            where: { user_id: userId },
            _max: { display_order: true },
        });
        return this.prisma.saas_practical_event_types.create({
            data: {
                user_id: userId,
                name: data.name,
                direction: data.direction,
                unit: data.unit,
                display_order: (maxOrder._max.display_order || 0) + 1,
                is_default: false,
            },
        });
    }
    async updateEventType(id, userId, data) {
        return this.prisma.saas_practical_event_types.updateMany({
            where: { id, user_id: userId },
            data,
        });
    }
    async deleteEventType(id, userId) {
        const eventType = await this.prisma.saas_practical_event_types.findFirst({
            where: { id, user_id: userId },
        });
        if (eventType) {
            await this.prisma.saas_practical_records.deleteMany({
                where: { user_id: userId, event_name: eventType.name },
            });
        }
        return this.prisma.saas_practical_event_types.deleteMany({
            where: { id, user_id: userId },
        });
    }
    async getRecords(userId) {
        return this.prisma.saas_practical_records.findMany({
            where: { user_id: userId },
            orderBy: [{ event_name: 'asc' }, { record_date: 'desc' }],
        });
    }
    async getRecordsByEvent(userId, eventName) {
        return this.prisma.saas_practical_records.findMany({
            where: { user_id: userId, event_name: eventName },
            orderBy: { record_date: 'desc' },
        });
    }
    async getHistory(userId, eventName) {
        const records = await this.prisma.saas_practical_records.findMany({
            where: { user_id: userId, event_name: eventName },
            orderBy: { record_date: 'asc' },
            select: {
                id: true,
                record: true,
                numeric_record: true,
                record_date: true,
                memo: true,
            },
        });
        const eventType = await this.prisma.saas_practical_event_types.findFirst({
            where: { user_id: userId, name: eventName },
        });
        if (!eventType) {
            return { records, eventType: null, stats: null };
        }
        const numericValues = records
            .map((r) => (r.numeric_record ? Number(r.numeric_record) : null))
            .filter((v) => v !== null);
        let stats = null;
        if (numericValues.length > 0) {
            const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
            const pb = eventType.direction === 'lower'
                ? Math.min(...numericValues)
                : Math.max(...numericValues);
            const current = numericValues[numericValues.length - 1];
            stats = {
                average: Math.round(avg * 100) / 100,
                pb,
                current,
                count: numericValues.length,
            };
        }
        return { records, eventType, stats };
    }
    async createRecord(userId, data) {
        const numericRecord = this.parseRecordToNumber(data.record);
        return this.prisma.saas_practical_records.create({
            data: {
                user_id: userId,
                event_name: data.event_name,
                record: data.record,
                numeric_record: numericRecord,
                record_date: data.record_date,
                memo: data.memo,
            },
        });
    }
    async updateRecord(id, userId, data) {
        const updateData = {
            record: data.record,
            record_date: data.record_date,
            memo: data.memo,
            updated_at: new Date(),
        };
        if (data.record !== undefined) {
            updateData.numeric_record = this.parseRecordToNumber(data.record);
        }
        return this.prisma.saas_practical_records.updateMany({
            where: { id, user_id: userId },
            data: updateData,
        });
    }
    async deleteRecord(id, userId) {
        return this.prisma.saas_practical_records.deleteMany({
            where: { id, user_id: userId },
        });
    }
    parseRecordToNumber(record) {
        if (!record)
            return null;
        const match = record.match(/[\d.]+/);
        if (match) {
            const num = parseFloat(match[0]);
            if (!isNaN(num)) {
                return new library_1.Decimal(num);
            }
        }
        return null;
    }
};
exports.PracticalService = PracticalService;
exports.PracticalService = PracticalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PracticalService);
//# sourceMappingURL=practical.service.js.map