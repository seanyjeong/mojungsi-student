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
exports.ScoresService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ScoresService = class ScoresService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getScores(userId) {
        return this.prisma.saas_saved_scores.findMany({
            where: { user_id: userId },
            orderBy: { exam_type: 'asc' },
        });
    }
    async getScoreByExamType(userId, examType, year = 2026) {
        return this.prisma.saas_saved_scores.findUnique({
            where: {
                user_id_exam_type_year: {
                    user_id: userId,
                    exam_type: examType,
                    year,
                },
            },
        });
    }
    async upsertScore(userId, examType, scores, year = 2026) {
        return this.prisma.saas_saved_scores.upsert({
            where: {
                user_id_exam_type_year: {
                    user_id: userId,
                    exam_type: examType,
                    year,
                },
            },
            create: {
                user_id: userId,
                exam_type: examType,
                year,
                scores,
            },
            update: {
                scores,
                updated_at: new Date(),
            },
        });
    }
    async deleteScore(userId, examType, year = 2026) {
        return this.prisma.saas_saved_scores.delete({
            where: {
                user_id_exam_type_year: {
                    user_id: userId,
                    exam_type: examType,
                    year,
                },
            },
        });
    }
};
exports.ScoresService = ScoresService;
exports.ScoresService = ScoresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScoresService);
//# sourceMappingURL=scores.service.js.map