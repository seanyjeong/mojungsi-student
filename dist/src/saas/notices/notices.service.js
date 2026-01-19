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
exports.NoticesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");

let NoticesService = class NoticesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }

    // 공지 목록 조회 (학생용 - 공개된 것만)
    async getNotices(userId) {
        const notices = await this.prisma.saas_notices.findMany({
            where: {
                is_active: true,
                OR: [
                    { published_at: null },
                    { published_at: { lte: new Date() } }
                ]
            },
            orderBy: { created_at: 'desc' },
            take: 20,
        });

        // 읽음 상태 조회
        const reads = await this.prisma.saas_notice_reads.findMany({
            where: {
                user_id: userId,
                notice_id: { in: notices.map(n => n.id) }
            },
            select: { notice_id: true }
        });
        const readIds = new Set(reads.map(r => r.notice_id));

        return notices.map(notice => ({
            ...notice,
            is_read: readIds.has(notice.id)
        }));
    }

    // 최신 공지 3개 (대시보드용 - userId는 선택적)
    async getLatestNotices(userId) {
        const notices = await this.prisma.saas_notices.findMany({
            where: {
                is_active: true,
                OR: [
                    { published_at: null },
                    { published_at: { lte: new Date() } }
                ]
            },
            orderBy: { created_at: 'desc' },
            take: 3,
        });

        // 로그인 안 한 경우 읽음 상태 없이 반환
        if (!userId) {
            return notices.map(notice => ({
                ...notice,
                isRead: false
            }));
        }

        const reads = await this.prisma.saas_notice_reads.findMany({
            where: {
                user_id: userId,
                notice_id: { in: notices.map(n => n.id) }
            },
            select: { notice_id: true }
        });
        const readIds = new Set(reads.map(r => r.notice_id));

        return notices.map(notice => ({
            ...notice,
            isRead: readIds.has(notice.id)
        }));
    }

    // 읽지 않은 공지 개수
    async getUnreadCount(userId) {
        const notices = await this.prisma.saas_notices.findMany({
            where: {
                is_active: true,
                OR: [
                    { published_at: null },
                    { published_at: { lte: new Date() } }
                ]
            },
            select: { id: true }
        });

        const reads = await this.prisma.saas_notice_reads.findMany({
            where: {
                user_id: userId,
                notice_id: { in: notices.map(n => n.id) }
            },
            select: { notice_id: true }
        });

        return notices.length - reads.length;
    }

    // 공지 상세 조회
    async getNotice(id, userId) {
        const notice = await this.prisma.saas_notices.findFirst({
            where: {
                id,
                is_active: true,
            }
        });

        if (!notice) {
            throw new common_1.NotFoundException('공지사항을 찾을 수 없습니다');
        }

        const read = await this.prisma.saas_notice_reads.findUnique({
            where: {
                user_id_notice_id: { user_id: userId, notice_id: id }
            }
        });

        return {
            ...notice,
            is_read: !!read
        };
    }

    // 읽음 표시
    async markAsRead(noticeId, userId) {
        await this.prisma.saas_notice_reads.upsert({
            where: {
                user_id_notice_id: { user_id: userId, notice_id: noticeId }
            },
            update: { read_at: new Date() },
            create: {
                user_id: userId,
                notice_id: noticeId,
            }
        });
        return { success: true };
    }
};
exports.NoticesService = NoticesService;
exports.NoticesService = NoticesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NoticesService);
