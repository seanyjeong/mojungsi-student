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

// ========== Auth API ==========

export async function getKakaoLoginUrl(): Promise<{ url: string }> {
  const response = await fetch(`${API_BASE_URL}/saas/auth/kakao/login-url`);

  if (!response.ok) {
    throw new Error("Failed to get Kakao login URL");
  }

  return response.json();
}

export async function kakaoCallback(code: string): Promise<{
  accessToken: string;
  user: {
    id: number;
    nickname: string;
    email: string | null;
    profileImage: string | null;
  };
}> {
  const response = await fetch(
    `${API_BASE_URL}/saas/auth/kakao/callback?code=${encodeURIComponent(code)}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return response.json();
}

export async function getMe(token: string) {
  const response = await fetch(`${API_BASE_URL}/saas/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get user info");
  }

  return response.json();
}
