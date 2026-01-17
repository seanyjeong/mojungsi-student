import { ScoreForm } from "@/types";

const STORAGE_KEY = "jungsi-scores";
const CALC_EXAM_KEY = "jungsi-calc-exam";

export function saveScores(scores: ScoreForm): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch (error) {
    console.error("Failed to save scores:", error);
  }
}

export function loadScores(): ScoreForm | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error("Failed to load scores:", error);
    return null;
  }
}

export function clearScores(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear scores:", error);
  }
}

// 계산에 사용할 시험 타입 저장/로드
export function saveCalcExamType(examType: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CALC_EXAM_KEY, examType);
  } catch (error) {
    console.error("Failed to save calc exam type:", error);
  }
}

export function loadCalcExamType(): string {
  if (typeof window === "undefined") return "수능";
  try {
    return localStorage.getItem(CALC_EXAM_KEY) || "수능";
  } catch (error) {
    console.error("Failed to load calc exam type:", error);
    return "수능";
  }
}
