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
exports.AdminNoticesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");

let AdminNoticesService = class AdminNoticesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }

    // 공지 목록 조회 (전체)
    async getNotices() {
        return this.prisma.saas_notices.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                _count: {
                    select: { reads: true }
                }
            }
        });
    }

    // 공지 상세 조회
    async getNotice(id) {
        const notice = await this.prisma.saas_notices.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { reads: true }
                }
            }
        });
        if (!notice) {
            throw new common_1.NotFoundException('공지사항을 찾을 수 없습니다');
        }
        return notice;
    }

    // 공지 생성
    async createNotice(data) {
        return this.prisma.saas_notices.create({
            data: {
                title: data.title,
                content: data.content,
                type: data.type || 'general',
                is_active: data.is_active !== false,
                published_at: data.published_at ? new Date(data.published_at) : null,
            }
        });
    }

    // 공지 수정
    async updateNotice(id, data) {
        const notice = await this.prisma.saas_notices.findUnique({ where: { id } });
        if (!notice) {
            throw new common_1.NotFoundException('공지사항을 찾을 수 없습니다');
        }

        return this.prisma.saas_notices.update({
            where: { id },
            data: {
                title: data.title,
                content: data.content,
                type: data.type,
                is_active: data.is_active,
                published_at: data.published_at ? new Date(data.published_at) : null,
            }
        });
    }

    // 공지 삭제
    async deleteNotice(id) {
        const notice = await this.prisma.saas_notices.findUnique({ where: { id } });
        if (!notice) {
            throw new common_1.NotFoundException('공지사항을 찾을 수 없습니다');
        }

        await this.prisma.saas_notices.delete({ where: { id } });
        return { success: true };
    }

    // 공지 활성화/비활성화 토글
    async toggleActive(id) {
        const notice = await this.prisma.saas_notices.findUnique({ where: { id } });
        if (!notice) {
            throw new common_1.NotFoundException('공지사항을 찾을 수 없습니다');
        }

        return this.prisma.saas_notices.update({
            where: { id },
            data: { is_active: !notice.is_active }
        });
    }
};
exports.AdminNoticesService = AdminNoticesService;
exports.AdminNoticesService = AdminNoticesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminNoticesService);
