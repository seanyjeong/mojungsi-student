import { BaseCalculator } from './base.calculator';
import { StudentScore, FormulaConfig, CalculationResult } from './types';
export declare class StandardRatioCalculator extends BaseCalculator {
    constructor(formula: FormulaConfig, student: StudentScore);
    calculate(): CalculationResult;
    private applySelectN;
    private calculateSelectTotalRatio;
}
