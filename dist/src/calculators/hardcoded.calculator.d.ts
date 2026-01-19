import { BaseCalculator } from './base.calculator';
import { StudentScore, FormulaConfig, CalculationResult } from './types';
export declare class HardcodedCalculator extends BaseCalculator {
    constructor(formula: FormulaConfig, student: StudentScore);
    calculate(): CalculationResult;
    private calculateSunmoon;
    private calculateKyungdong;
}
