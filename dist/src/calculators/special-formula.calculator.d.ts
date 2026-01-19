import { BaseCalculator } from './base.calculator';
import { StudentScore, FormulaConfig, CalculationResult } from './types';
export declare class SpecialFormulaCalculator extends BaseCalculator {
    constructor(formula: FormulaConfig, student: StudentScore);
    calculate(): CalculationResult;
    private buildContext;
    private isMathBonusEligible;
    private isSocialInquiry;
}
