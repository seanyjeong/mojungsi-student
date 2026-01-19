"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRADES = exports.MATH_SUBJECTS = exports.KOREAN_SUBJECTS = void 0;
exports.KOREAN_SUBJECTS = [
    { value: "화법과작문", label: "화법과작문" },
    { value: "언어와매체", label: "언어와매체" },
];
exports.MATH_SUBJECTS = [
    { value: "확률과통계", label: "확률과통계" },
    { value: "미적분", label: "미적분" },
    { value: "기하", label: "기하" },
];
exports.GRADES = Array.from({ length: 9 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}등급`,
}));
//# sourceMappingURL=index.js.map