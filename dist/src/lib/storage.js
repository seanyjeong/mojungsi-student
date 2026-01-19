"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveScores = saveScores;
exports.loadScores = loadScores;
exports.clearScores = clearScores;
exports.saveCalcExamType = saveCalcExamType;
exports.loadCalcExamType = loadCalcExamType;
const STORAGE_KEY = "jungsi-scores";
const CALC_EXAM_KEY = "jungsi-calc-exam";
function saveScores(scores) {
    if (typeof window === "undefined")
        return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    }
    catch (error) {
        console.error("Failed to save scores:", error);
    }
}
function loadScores() {
    if (typeof window === "undefined")
        return null;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved)
            return null;
        return JSON.parse(saved);
    }
    catch (error) {
        console.error("Failed to load scores:", error);
        return null;
    }
}
function clearScores() {
    if (typeof window === "undefined")
        return;
    try {
        localStorage.removeItem(STORAGE_KEY);
    }
    catch (error) {
        console.error("Failed to clear scores:", error);
    }
}
function saveCalcExamType(examType) {
    if (typeof window === "undefined")
        return;
    try {
        localStorage.setItem(CALC_EXAM_KEY, examType);
    }
    catch (error) {
        console.error("Failed to save calc exam type:", error);
    }
}
function loadCalcExamType() {
    if (typeof window === "undefined")
        return "수능";
    try {
        return localStorage.getItem(CALC_EXAM_KEY) || "수능";
    }
    catch (error) {
        console.error("Failed to load calc exam type:", error);
        return "수능";
    }
}
//# sourceMappingURL=storage.js.map