import { FormulaConfigsService } from './formula-configs.service';
import { CreateFormulaConfigDto } from './dto/create-formula-config.dto';
import { UpdateFormulaConfigDto } from './dto/update-formula-config.dto';
export declare class FormulaConfigsController {
    private readonly formulaConfigsService;
    constructor(formulaConfigsService: FormulaConfigsService);
    create(createFormulaConfigDto: CreateFormulaConfigDto): Promise<{
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
        english_scores: import("@prisma/client/runtime/library").JsonValue | null;
        history_scores: import("@prisma/client/runtime/library").JsonValue | null;
        selection_rules: import("@prisma/client/runtime/library").JsonValue | null;
        bonus_rules: import("@prisma/client/runtime/library").JsonValue | null;
        created_at: Date | null;
        dept_id: number;
        config_id: number;
        suneung_ratio: import("@prisma/client/runtime/library").Decimal | null;
        subjects_config: import("@prisma/client/runtime/library").JsonValue | null;
        special_mode: import("@prisma/client/runtime/library").JsonValue | null;
        legacy_formula: string | null;
        template_id: number | null;
        template_params: import("@prisma/client/runtime/library").JsonValue | null;
        display_config: import("@prisma/client/runtime/library").JsonValue | null;
        calculation_mode: string | null;
        legacy_uid: number | null;
    }>;
    findAll(yearId?: string, univId?: string, recruit_group?: string, search?: string): Promise<({
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
        english_scores: import("@prisma/client/runtime/library").JsonValue | null;
        history_scores: import("@prisma/client/runtime/library").JsonValue | null;
        selection_rules: import("@prisma/client/runtime/library").JsonValue | null;
        bonus_rules: import("@prisma/client/runtime/library").JsonValue | null;
        created_at: Date | null;
        dept_id: number;
        config_id: number;
        suneung_ratio: import("@prisma/client/runtime/library").Decimal | null;
        subjects_config: import("@prisma/client/runtime/library").JsonValue | null;
        special_mode: import("@prisma/client/runtime/library").JsonValue | null;
        legacy_formula: string | null;
        template_id: number | null;
        template_params: import("@prisma/client/runtime/library").JsonValue | null;
        display_config: import("@prisma/client/runtime/library").JsonValue | null;
        calculation_mode: string | null;
        legacy_uid: number | null;
    })[]>;
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
        english_scores: import("@prisma/client/runtime/library").JsonValue | null;
        history_scores: import("@prisma/client/runtime/library").JsonValue | null;
        selection_rules: import("@prisma/client/runtime/library").JsonValue | null;
        bonus_rules: import("@prisma/client/runtime/library").JsonValue | null;
        created_at: Date | null;
        dept_id: number;
        config_id: number;
        suneung_ratio: import("@prisma/client/runtime/library").Decimal | null;
        subjects_config: import("@prisma/client/runtime/library").JsonValue | null;
        special_mode: import("@prisma/client/runtime/library").JsonValue | null;
        legacy_formula: string | null;
        template_id: number | null;
        template_params: import("@prisma/client/runtime/library").JsonValue | null;
        display_config: import("@prisma/client/runtime/library").JsonValue | null;
        calculation_mode: string | null;
        legacy_uid: number | null;
    }>;
    findOne(id: number): Promise<{
        departments: {
            english_grade_tables: {
                id: number;
                score: import("@prisma/client/runtime/library").Decimal;
                dept_id: number;
                grade: number;
            }[];
            history_grade_tables: {
                id: number;
                score: import("@prisma/client/runtime/library").Decimal;
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
        english_scores: import("@prisma/client/runtime/library").JsonValue | null;
        history_scores: import("@prisma/client/runtime/library").JsonValue | null;
        selection_rules: import("@prisma/client/runtime/library").JsonValue | null;
        bonus_rules: import("@prisma/client/runtime/library").JsonValue | null;
        created_at: Date | null;
        dept_id: number;
        config_id: number;
        suneung_ratio: import("@prisma/client/runtime/library").Decimal | null;
        subjects_config: import("@prisma/client/runtime/library").JsonValue | null;
        special_mode: import("@prisma/client/runtime/library").JsonValue | null;
        legacy_formula: string | null;
        template_id: number | null;
        template_params: import("@prisma/client/runtime/library").JsonValue | null;
        display_config: import("@prisma/client/runtime/library").JsonValue | null;
        calculation_mode: string | null;
        legacy_uid: number | null;
    }>;
    update(id: number, updateFormulaConfigDto: UpdateFormulaConfigDto): Promise<{
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
        english_scores: import("@prisma/client/runtime/library").JsonValue | null;
        history_scores: import("@prisma/client/runtime/library").JsonValue | null;
        selection_rules: import("@prisma/client/runtime/library").JsonValue | null;
        bonus_rules: import("@prisma/client/runtime/library").JsonValue | null;
        created_at: Date | null;
        dept_id: number;
        config_id: number;
        suneung_ratio: import("@prisma/client/runtime/library").Decimal | null;
        subjects_config: import("@prisma/client/runtime/library").JsonValue | null;
        special_mode: import("@prisma/client/runtime/library").JsonValue | null;
        legacy_formula: string | null;
        template_id: number | null;
        template_params: import("@prisma/client/runtime/library").JsonValue | null;
        display_config: import("@prisma/client/runtime/library").JsonValue | null;
        calculation_mode: string | null;
        legacy_uid: number | null;
    }>;
    remove(id: number): Promise<{
        updated_at: Date | null;
        total_score: number | null;
        practical_total: number | null;
        english_scores: import("@prisma/client/runtime/library").JsonValue | null;
        history_scores: import("@prisma/client/runtime/library").JsonValue | null;
        selection_rules: import("@prisma/client/runtime/library").JsonValue | null;
        bonus_rules: import("@prisma/client/runtime/library").JsonValue | null;
        created_at: Date | null;
        dept_id: number;
        config_id: number;
        suneung_ratio: import("@prisma/client/runtime/library").Decimal | null;
        subjects_config: import("@prisma/client/runtime/library").JsonValue | null;
        special_mode: import("@prisma/client/runtime/library").JsonValue | null;
        legacy_formula: string | null;
        template_id: number | null;
        template_params: import("@prisma/client/runtime/library").JsonValue | null;
        display_config: import("@prisma/client/runtime/library").JsonValue | null;
        calculation_mode: string | null;
        legacy_uid: number | null;
    }>;
    copyToNewYear(fromYearId: number, toYearId: number): Promise<{
        copied: number;
        skipped: number;
        errors: string[];
    }>;
}
