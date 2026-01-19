import { CalculatorsService } from './calculators.service';
declare class SubjectScoreDto {
    subject?: string;
    std?: number;
    pct?: number;
    grade?: number;
}
declare class GradeOnlyDto {
    grade?: number;
}
declare class FrontendScoresDto {
    korean?: SubjectScoreDto;
    math?: SubjectScoreDto;
    english?: GradeOnlyDto;
    history?: GradeOnlyDto;
    inquiry1?: SubjectScoreDto;
    inquiry2?: SubjectScoreDto;
}
declare class CalculateSingleRequestDto {
    U_ID: number;
    year: number;
    scores: FrontendScoresDto;
    basis_exam?: string;
}
declare class CalculateBatchRequestDto {
    U_IDs: number[];
    year: number;
    scores: FrontendScoresDto;
}
declare class CalculateAllRequestDto {
    year: number;
    scores: FrontendScoresDto;
}
export declare class CalculatorsController {
    private readonly calculatorsService;
    constructor(calculatorsService: CalculatorsService);
    calculateSingle(dto: CalculateSingleRequestDto): Promise<any>;
    calculateBatch(dto: CalculateBatchRequestDto): Promise<any>;
    calculateAll(dto: CalculateAllRequestDto): Promise<any>;
    getUniversityList(year: string): Promise<any>;
    getFormulaDetails(U_ID: string, year: string): Promise<any>;
    private transformFrontendScores;
}
export {};
