import { ScoreForm } from "@/types";

const STORAGE_KEY = "jungsi-scores";

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
