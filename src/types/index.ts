// Score input types
export interface ScoreForm {
  korean: {
    subject: string;
    std: number;
    pct: number;
    grade: number;
  };
  math: {
    subject: string;
    std: number;
    pct: number;
    grade: number;
  };
  english: {
    grade: number;
  };
  history: {
    grade: number;
  };
  inquiry1: {
    subject: string;
    std: number;
    pct: number;
    grade: number;
  };
  inquiry2: {
    subject: string;
    std: number;
    pct: number;
    grade: number;
  };
}

// API response types - Single calculate endpoint (POST /calculate)
export interface SingleCalculationResult {
  success: boolean;
  universityName: string;
  departmentName: string;
  result: {
    totalScore: string; // API returns as string
    breakdown?: {
      base?: number;
      select?: number;
      history?: number;
      english_bonus?: number;
    };
    calculationLog?: string[];
  };
}

// Legacy type alias for backward compatibility
export interface CalculationResult {
  finalScore: number;
  breakdown: {
    korean: number;
    math: number;
    english: number;
    inquiry: number;
    history: number;
  };
  scoreInfo: {
    totalScore: number;
    suneungMaxScore: number;
    silgiMaxScore: number;
  };
  university?: UniversityInfo;
}

export interface UniversityInfo {
  id: number;
  univId: number;
  univName: string;
  deptName: string;
  yearId: number;
  mojipgun: "가" | "나" | "다";
  mojipInwon: number;
  region?: string;
}

export interface BatchCalculationResult extends CalculationResult {
  university: UniversityInfo;
  deptId: number;
}

// Korean subject options
export const KOREAN_SUBJECTS = [
  { value: "화법과작문", label: "화법과작문" },
  { value: "언어와매체", label: "언어와매체" },
] as const;

export const MATH_SUBJECTS = [
  { value: "확률과통계", label: "확률과통계" },
  { value: "미적분", label: "미적분" },
  { value: "기하", label: "기하" },
] as const;

export const GRADES = Array.from({ length: 9 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}등급`,
}));
