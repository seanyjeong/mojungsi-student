"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculatorFactory = void 0;
const standard_ratio_calculator_1 = require("./standard-ratio.calculator");
const special_formula_calculator_1 = require("./special-formula.calculator");
const hardcoded_calculator_1 = require("./hardcoded.calculator");
const HARDCODED_UIDS = [148, 149, 76, 1148, 1149, 1076];
class CalculatorFactory {
    static create(formula, student) {
        const uid = formula.legacyUid;
        if (uid && HARDCODED_UIDS.includes(uid)) {
            return new hardcoded_calculator_1.HardcodedCalculator(formula, student);
        }
        if (formula.legacyFormula &&
            formula.legacyFormula.trim() !== '') {
            return new special_formula_calculator_1.SpecialFormulaCalculator(formula, student);
        }
        return new standard_ratio_calculator_1.StandardRatioCalculator(formula, student);
    }
}
exports.CalculatorFactory = CalculatorFactory;
//# sourceMappingURL=calculator.factory.js.map