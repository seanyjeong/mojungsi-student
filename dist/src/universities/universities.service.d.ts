import { PrismaService } from '../prisma/prisma.service';
export declare class UniversitiesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(yearId?: number): Promise<{
        region: string;
        isWomensUniv: boolean;
        departments: {
            region: string;
            jungsi_ratio: {
                suneung: number | null;
                naesin: number | null;
                silgi: number | null;
                silgi_total: number | null;
            } | null;
            subject_display: {
                korean: string | null;
                math: string | null;
                english: string | null;
                inquiry: string | null;
                history: string | null;
                inquiry_count: string | null;
            } | null;
            practical_events: string[];
            formula_configs: {
                created_at: Date | null;
                updated_at: Date | null;
                dept_id: number;
                config_id: number;
                total_score: number | null;
                suneung_ratio: import("@prisma/client/runtime/library").Decimal | null;
                subjects_config: import("@prisma/client/runtime/library").JsonValue | null;
                selection_rules: import("@prisma/client/runtime/library").JsonValue | null;
                bonus_rules: import("@prisma/client/runtime/library").JsonValue | null;
                special_mode: import("@prisma/client/runtime/library").JsonValue | null;
                legacy_formula: string | null;
                template_id: number | null;
                template_params: import("@prisma/client/runtime/library").JsonValue | null;
                display_config: import("@prisma/client/runtime/library").JsonValue | null;
                english_scores: import("@prisma/client/runtime/library").JsonValue | null;
                history_scores: import("@prisma/client/runtime/library").JsonValue | null;
                calculation_mode: string | null;
                legacy_uid: number | null;
                practical_total: number | null;
            } | null;
            univ_id: number;
            created_at: Date | null;
            year_id: number;
            type: string | null;
            dept_name: string;
            teacher_cert: string | null;
            step_type: string | null;
            updated_at: Date | null;
            dept_id: number;
            recruit_group: string | null;
            recruit_count: number | null;
        }[];
        univ_id: number;
        univ_name: string;
        short_name: string | null;
        logo_url: string | null;
        created_at: Date | null;
    }[]>;
    findOne(univId: number): Promise<({
        departments: ({
            formula_configs: {
                created_at: Date | null;
                updated_at: Date | null;
                dept_id: number;
                config_id: number;
                total_score: number | null;
                suneung_ratio: import("@prisma/client/runtime/library").Decimal | null;
                subjects_config: import("@prisma/client/runtime/library").JsonValue | null;
                selection_rules: import("@prisma/client/runtime/library").JsonValue | null;
                bonus_rules: import("@prisma/client/runtime/library").JsonValue | null;
                special_mode: import("@prisma/client/runtime/library").JsonValue | null;
                legacy_formula: string | null;
                template_id: number | null;
                template_params: import("@prisma/client/runtime/library").JsonValue | null;
                display_config: import("@prisma/client/runtime/library").JsonValue | null;
                english_scores: import("@prisma/client/runtime/library").JsonValue | null;
                history_scores: import("@prisma/client/runtime/library").JsonValue | null;
                calculation_mode: string | null;
                legacy_uid: number | null;
                practical_total: number | null;
            } | null;
            english_grade_tables: {
                dept_id: number;
                id: number;
                grade: number;
                score: import("@prisma/client/runtime/library").Decimal;
            }[];
            history_grade_tables: {
                dept_id: number;
                id: number;
                grade: number;
                score: import("@prisma/client/runtime/library").Decimal;
            }[];
            inquiry_conv_tables: {
                dept_id: number;
                id: number;
                track: string;
                percentile: number;
                converted_std_score: import("@prisma/client/runtime/library").Decimal;
            }[];
        } & {
            univ_id: number;
            created_at: Date | null;
            year_id: number;
            type: string | null;
            dept_name: string;
            teacher_cert: string | null;
            step_type: string | null;
            updated_at: Date | null;
            dept_id: number;
            recruit_group: string | null;
            recruit_count: number | null;
        })[];
    } & {
        univ_id: number;
        univ_name: string;
        short_name: string | null;
        region: string | null;
        logo_url: string | null;
        created_at: Date | null;
    }) | null>;
    findDepartments(options?: {
        yearId?: number;
        univId?: number;
        mojipgun?: 'ga' | 'na' | 'da';
        region?: string;
    }): Promise<({
        universities: {
            univ_id: number;
            univ_name: string;
            short_name: string | null;
            region: string | null;
            logo_url: string | null;
            created_at: Date | null;
        };
        formula_configs: {
            created_at: Date | null;
            updated_at: Date | null;
            dept_id: number;
            config_id: number;
            total_score: number | null;
            suneung_ratio: import("@prisma/client/runtime/library").Decimal | null;
            subjects_config: import("@prisma/client/runtime/library").JsonValue | null;
            selection_rules: import("@prisma/client/runtime/library").JsonValue | null;
            bonus_rules: import("@prisma/client/runtime/library").JsonValue | null;
            special_mode: import("@prisma/client/runtime/library").JsonValue | null;
            legacy_formula: string | null;
            template_id: number | null;
            template_params: import("@prisma/client/runtime/library").JsonValue | null;
            display_config: import("@prisma/client/runtime/library").JsonValue | null;
            english_scores: import("@prisma/client/runtime/library").JsonValue | null;
            history_scores: import("@prisma/client/runtime/library").JsonValue | null;
            calculation_mode: string | null;
            legacy_uid: number | null;
            practical_total: number | null;
        } | null;
    } & {
        univ_id: number;
        created_at: Date | null;
        year_id: number;
        type: string | null;
        dept_name: string;
        teacher_cert: string | null;
        step_type: string | null;
        updated_at: Date | null;
        dept_id: number;
        recruit_group: string | null;
        recruit_count: number | null;
    })[]>;
    findDepartmentById(deptId: number): Promise<({
        universities: {
            univ_id: number;
            univ_name: string;
            short_name: string | null;
            region: string | null;
            logo_url: string | null;
            created_at: Date | null;
        };
        formula_configs: {
            created_at: Date | null;
            updated_at: Date | null;
            dept_id: number;
            config_id: number;
            total_score: number | null;
            suneung_ratio: import("@prisma/client/runtime/library").Decimal | null;
            subjects_config: import("@prisma/client/runtime/library").JsonValue | null;
            selection_rules: import("@prisma/client/runtime/library").JsonValue | null;
            bonus_rules: import("@prisma/client/runtime/library").JsonValue | null;
            special_mode: import("@prisma/client/runtime/library").JsonValue | null;
            legacy_formula: string | null;
            template_id: number | null;
            template_params: import("@prisma/client/runtime/library").JsonValue | null;
            display_config: import("@prisma/client/runtime/library").JsonValue | null;
            english_scores: import("@prisma/client/runtime/library").JsonValue | null;
            history_scores: import("@prisma/client/runtime/library").JsonValue | null;
            calculation_mode: string | null;
            legacy_uid: number | null;
            practical_total: number | null;
        } | null;
        english_grade_tables: {
            dept_id: number;
            id: number;
            grade: number;
            score: import("@prisma/client/runtime/library").Decimal;
        }[];
        history_grade_tables: {
            dept_id: number;
            id: number;
            grade: number;
            score: import("@prisma/client/runtime/library").Decimal;
        }[];
        inquiry_conv_tables: {
            dept_id: number;
            id: number;
            track: string;
            percentile: number;
            converted_std_score: import("@prisma/client/runtime/library").Decimal;
        }[];
        practical_calc_rules: {
            created_at: Date | null;
            dept_id: number;
            id: number;
            rule_type: import(".prisma/client").$Enums.practical_calc_rules_rule_type;
            rule_config: import("@prisma/client/runtime/library").JsonValue;
        } | null;
        practical_score_tables: {
            dept_id: number;
            id: number;
            score: import("@prisma/client/runtime/library").Decimal | null;
            event_name: string;
            gender: string | null;
            record: string | null;
        }[];
    } & {
        univ_id: number;
        created_at: Date | null;
        year_id: number;
        type: string | null;
        dept_name: string;
        teacher_cert: string | null;
        step_type: string | null;
        updated_at: Date | null;
        dept_id: number;
        recruit_group: string | null;
        recruit_count: number | null;
    }) | null>;
    countUniversities(): Promise<number>;
    countDepartments(yearId?: number): Promise<number>;
}
