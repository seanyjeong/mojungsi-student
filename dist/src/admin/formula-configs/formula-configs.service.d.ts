import { PrismaService } from '../../prisma/prisma.service';
import { CreateFormulaConfigDto } from './dto/create-formula-config.dto';
import { UpdateFormulaConfigDto } from './dto/update-formula-config.dto';
import { Prisma } from '@prisma/client';
export declare class FormulaConfigsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(params?: {
        yearId?: number;
        univId?: number;
        recruit_group?: string;
        search?: string;
    }): Promise<({
        departments: {
            universities: {
                region: string | null;
                univ_name: string;
                logo_url: string | null;
                univ_id: number;
                short_name: string | null;
                created_at: Date | null;
            };
        } & {
            type: string | null;
            dept_name: string;
            teacher_cert: string | null;
            step_type: string | null;
            updated_at: Date | null;
            univ_id: number;
            created_at: Date | null;
            year_id: number;
            dept_id: number;
            recruit_group: string | null;
            recruit_count: number | null;
        };
    } & {
        updated_at: Date | null;
        total_score: number | null;
        practical_total: number | null;
        english_scores: Prisma.JsonValue | null;
        history_scores: Prisma.JsonValue | null;
        selection_rules: Prisma.JsonValue | null;
        bonus_rules: Prisma.JsonValue | null;
        created_at: Date | null;
        dept_id: number;
        config_id: number;
        suneung_ratio: Prisma.Decimal | null;
        subjects_config: Prisma.JsonValue | null;
        special_mode: Prisma.JsonValue | null;
        legacy_formula: string | null;
        template_id: number | null;
        template_params: Prisma.JsonValue | null;
        display_config: Prisma.JsonValue | null;
        calculation_mode: string | null;
        legacy_uid: number | null;
    })[]>;
    findOne(id: number): Promise<{
        departments: {
            english_grade_tables: {
                id: number;
                score: Prisma.Decimal;
                dept_id: number;
                grade: number;
            }[];
            history_grade_tables: {
                id: number;
                score: Prisma.Decimal;
                dept_id: number;
                grade: number;
            }[];
            universities: {
                region: string | null;
                univ_name: string;
                logo_url: string | null;
                univ_id: number;
                short_name: string | null;
                created_at: Date | null;
            };
        } & {
            type: string | null;
            dept_name: string;
            teacher_cert: string | null;
            step_type: string | null;
            updated_at: Date | null;
            univ_id: number;
            created_at: Date | null;
            year_id: number;
            dept_id: number;
            recruit_group: string | null;
            recruit_count: number | null;
        };
    } & {
        updated_at: Date | null;
        total_score: number | null;
        practical_total: number | null;
        english_scores: Prisma.JsonValue | null;
        history_scores: Prisma.JsonValue | null;
        selection_rules: Prisma.JsonValue | null;
        bonus_rules: Prisma.JsonValue | null;
        created_at: Date | null;
        dept_id: number;
        config_id: number;
        suneung_ratio: Prisma.Decimal | null;
        subjects_config: Prisma.JsonValue | null;
        special_mode: Prisma.JsonValue | null;
        legacy_formula: string | null;
        template_id: number | null;
        template_params: Prisma.JsonValue | null;
        display_config: Prisma.JsonValue | null;
        calculation_mode: string | null;
        legacy_uid: number | null;
    }>;
    findByDeptId(deptId: number): Promise<{
        departments: {
            universities: {
                region: string | null;
                univ_name: string;
                logo_url: string | null;
                univ_id: number;
                short_name: string | null;
                created_at: Date | null;
            };
        } & {
            type: string | null;
            dept_name: string;
            teacher_cert: string | null;
            step_type: string | null;
            updated_at: Date | null;
            univ_id: number;
            created_at: Date | null;
            year_id: number;
            dept_id: number;
            recruit_group: string | null;
            recruit_count: number | null;
        };
    } & {
        updated_at: Date | null;
        total_score: number | null;
        practical_total: number | null;
        english_scores: Prisma.JsonValue | null;
        history_scores: Prisma.JsonValue | null;
        selection_rules: Prisma.JsonValue | null;
        bonus_rules: Prisma.JsonValue | null;
        created_at: Date | null;
        dept_id: number;
        config_id: number;
        suneung_ratio: Prisma.Decimal | null;
        subjects_config: Prisma.JsonValue | null;
        special_mode: Prisma.JsonValue | null;
        legacy_formula: string | null;
        template_id: number | null;
        template_params: Prisma.JsonValue | null;
        display_config: Prisma.JsonValue | null;
        calculation_mode: string | null;
        legacy_uid: number | null;
    }>;
    create(dto: CreateFormulaConfigDto): Promise<{
        departments: {
            universities: {
                region: string | null;
                univ_name: string;
                logo_url: string | null;
                univ_id: number;
                short_name: string | null;
                created_at: Date | null;
            };
        } & {
            type: string | null;
            dept_name: string;
            teacher_cert: string | null;
            step_type: string | null;
            updated_at: Date | null;
            univ_id: number;
            created_at: Date | null;
            year_id: number;
            dept_id: number;
            recruit_group: string | null;
            recruit_count: number | null;
        };
    } & {
        updated_at: Date | null;
        total_score: number | null;
        practical_total: number | null;
        english_scores: Prisma.JsonValue | null;
        history_scores: Prisma.JsonValue | null;
        selection_rules: Prisma.JsonValue | null;
        bonus_rules: Prisma.JsonValue | null;
        created_at: Date | null;
        dept_id: number;
        config_id: number;
        suneung_ratio: Prisma.Decimal | null;
        subjects_config: Prisma.JsonValue | null;
        special_mode: Prisma.JsonValue | null;
        legacy_formula: string | null;
        template_id: number | null;
        template_params: Prisma.JsonValue | null;
        display_config: Prisma.JsonValue | null;
        calculation_mode: string | null;
        legacy_uid: number | null;
    }>;
    update(id: number, dto: UpdateFormulaConfigDto): Promise<{
        departments: {
            universities: {
                region: string | null;
                univ_name: string;
                logo_url: string | null;
                univ_id: number;
                short_name: string | null;
                created_at: Date | null;
            };
        } & {
            type: string | null;
            dept_name: string;
            teacher_cert: string | null;
            step_type: string | null;
            updated_at: Date | null;
            univ_id: number;
            created_at: Date | null;
            year_id: number;
            dept_id: number;
            recruit_group: string | null;
            recruit_count: number | null;
        };
    } & {
        updated_at: Date | null;
        total_score: number | null;
        practical_total: number | null;
        english_scores: Prisma.JsonValue | null;
        history_scores: Prisma.JsonValue | null;
        selection_rules: Prisma.JsonValue | null;
        bonus_rules: Prisma.JsonValue | null;
        created_at: Date | null;
        dept_id: number;
        config_id: number;
        suneung_ratio: Prisma.Decimal | null;
        subjects_config: Prisma.JsonValue | null;
        special_mode: Prisma.JsonValue | null;
        legacy_formula: string | null;
        template_id: number | null;
        template_params: Prisma.JsonValue | null;
        display_config: Prisma.JsonValue | null;
        calculation_mode: string | null;
        legacy_uid: number | null;
    }>;
    remove(id: number): Promise<{
        updated_at: Date | null;
        total_score: number | null;
        practical_total: number | null;
        english_scores: Prisma.JsonValue | null;
        history_scores: Prisma.JsonValue | null;
        selection_rules: Prisma.JsonValue | null;
        bonus_rules: Prisma.JsonValue | null;
        created_at: Date | null;
        dept_id: number;
        config_id: number;
        suneung_ratio: Prisma.Decimal | null;
        subjects_config: Prisma.JsonValue | null;
        special_mode: Prisma.JsonValue | null;
        legacy_formula: string | null;
        template_id: number | null;
        template_params: Prisma.JsonValue | null;
        display_config: Prisma.JsonValue | null;
        calculation_mode: string | null;
        legacy_uid: number | null;
    }>;
    copyToNewYear(fromYearId: number, toYearId: number): Promise<{
        copied: number;
        skipped: number;
        errors: string[];
    }>;
}
