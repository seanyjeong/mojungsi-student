import { UniversitiesService } from './universities.service';
export declare class UniversitiesController {
    private readonly universitiesService;
    constructor(universitiesService: UniversitiesService);
    findAll(yearId?: string, search?: string): Promise<{
        univId: number;
        univName: string;
        shortName: string | null;
        region: string | null;
        logoUrl: string | null;
        deptCount: number;
    }[]>;
    findDepartments(univId: number, yearId?: string, recruit_group?: string): Promise<({
        formula_configs: {
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
        } | null;
        universities: {
            univ_name: string;
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
    })[]>;
}
