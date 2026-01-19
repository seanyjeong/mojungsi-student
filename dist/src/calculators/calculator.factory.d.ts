import { BaseCalculator } from './base.calculator';
import { FormulaConfig, StudentScore } from './types';
export declare class CalculatorFactory {
    static create(formula: FormulaConfig, student: StudentScore): BaseCalculator;
}
