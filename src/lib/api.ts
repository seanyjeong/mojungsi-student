import { ScoreForm, CalculationResult, BatchCalculationResult } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8900";

export async function calculateScore(
  deptId: number,
  scores: ScoreForm
): Promise<CalculationResult> {
  const response = await fetch(`${API_BASE_URL}/calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deptId,
      scores,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to calculate score");
  }

  return response.json();
}

export async function calculateBatch(
  scores: ScoreForm,
  yearId: number = 2026
): Promise<BatchCalculationResult[]> {
  const response = await fetch(`${API_BASE_URL}/calculate/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scores,
      yearId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to calculate batch scores");
  }

  return response.json();
}

export async function getUniversities(yearId: number = 2026) {
  const response = await fetch(
    `${API_BASE_URL}/universities?yearId=${yearId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch universities");
  }

  return response.json();
}

export async function getUniversityDetail(id: number) {
  const response = await fetch(`${API_BASE_URL}/universities/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch university detail");
  }

  return response.json();
}
