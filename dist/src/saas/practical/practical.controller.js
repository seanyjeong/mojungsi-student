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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PracticalController = void 0;
const common_1 = require("@nestjs/common");
const practical_service_1 = require("./practical.service");
const saas_auth_guard_1 = require("../auth/saas-auth.guard");
let PracticalController = class PracticalController {
    practicalService;
    constructor(practicalService) {
        this.practicalService = practicalService;
    }
    async getEventTypes(req) {
        return this.practicalService.getEventTypes(req.user.id);
    }
    async createEventType(req, body) {
        if (!body.name) {
            throw new common_1.HttpException('name is required', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!body.direction || !['lower', 'higher'].includes(body.direction)) {
            throw new common_1.HttpException('direction must be lower or higher', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.practicalService.createEventType(req.user.id, body);
    }
    async updateEventType(req, id, body) {
        if (body.direction && !['lower', 'higher'].includes(body.direction)) {
            throw new common_1.HttpException('direction must be lower or higher', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.practicalService.updateEventType(parseInt(id), req.user.id, body);
    }
    async deleteEventType(req, id) {
        return this.practicalService.deleteEventType(parseInt(id), req.user.id);
    }
    async initEventTypes(req) {
        return this.practicalService.initDefaultEventTypes(req.user.id);
    }
    async getRecords(req, event) {
        if (event) {
            return this.practicalService.getRecordsByEvent(req.user.id, event);
        }
        return this.practicalService.getRecords(req.user.id);
    }
    async getHistory(req, eventName) {
        return this.practicalService.getHistory(req.user.id, decodeURIComponent(eventName));
    }
    async createRecord(req, body) {
        if (!body.event_name) {
            throw new common_1.HttpException('event_name is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.practicalService.createRecord(req.user.id, {
            event_name: body.event_name,
            record: body.record,
            record_date: body.record_date ? new Date(body.record_date) : undefined,
            memo: body.memo,
        });
    }
    async updateRecord(req, id, body) {
        return this.practicalService.updateRecord(parseInt(id), req.user.id, {
            record: body.record,
            record_date: body.record_date ? new Date(body.record_date) : undefined,
            memo: body.memo,
        });
    }
    async deleteRecord(req, id) {
        return this.practicalService.deleteRecord(parseInt(id), req.user.id);
    }
};
exports.PracticalController = PracticalController;
__decorate([
    (0, common_1.Get)('event-types'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PracticalController.prototype, "getEventTypes", null);
__decorate([
    (0, common_1.Post)('event-types'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PracticalController.prototype, "createEventType", null);
__decorate([
    (0, common_1.Put)('event-types/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PracticalController.prototype, "updateEventType", null);
__decorate([
    (0, common_1.Delete)('event-types/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PracticalController.prototype, "deleteEventType", null);
__decorate([
    (0, common_1.Post)('event-types/init'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PracticalController.prototype, "initEventTypes", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('event')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PracticalController.prototype, "getRecords", null);
__decorate([
    (0, common_1.Get)('history/:eventName'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('eventName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PracticalController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PracticalController.prototype, "createRecord", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PracticalController.prototype, "updateRecord", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PracticalController.prototype, "deleteRecord", null);
exports.PracticalController = PracticalController = __decorate([
    (0, common_1.Controller)('saas/practical'),
    (0, common_1.UseGuards)(saas_auth_guard_1.SaasAuthGuard),
    __metadata("design:paramtypes", [practical_service_1.PracticalService])
], PracticalController);
//# sourceMappingURL=practical.controller.js.map