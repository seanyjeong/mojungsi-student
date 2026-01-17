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

// 전체 대학 환산점수 계산 (U_IDs 필요 없음)
export async function calculateAll(
  scores: ScoreForm,
  year: number = 2026
): Promise<{ success: boolean; results: Array<{ U_ID: number; 환산점수: number }>; count: number }> {
  const response = await fetch(`${API_BASE_URL}/calculate/all`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      year,
      scores,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to calculate all scores");
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

// ========== Profile API ==========

export async function getProfile(token: string) {
  const response = await fetch(`${API_BASE_URL}/saas/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to get profile");
  return response.json();
}

export async function updateProfile(
  token: string,
  data: { name?: string; school?: string; grade?: number; gender?: string }
) {
  const response = await fetch(`${API_BASE_URL}/saas/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update profile");
  return response.json();
}

// ========== Scores API ==========

export async function getScores(token: string, year: number = 2026) {
  const response = await fetch(`${API_BASE_URL}/saas/scores?year=${year}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to get scores");
  return response.json();
}

export async function getScoreByExamType(
  token: string,
  examType: string,
  year: number = 2026
) {
  const response = await fetch(
    `${API_BASE_URL}/saas/scores/${encodeURIComponent(examType)}?year=${year}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) return null;
  return response.json();
}

export async function saveScore(
  token: string,
  examType: string,
  scores: any,
  year: number = 2026
) {
  const response = await fetch(`${API_BASE_URL}/saas/scores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ examType, scores, year }),
  });
  if (!response.ok) throw new Error("Failed to save score");
  return response.json();
}

// ========== Saved Universities API ==========

export async function getSavedUniversities(token: string) {
  const response = await fetch(`${API_BASE_URL}/saas/universities/saved`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to get saved universities");
  return response.json();
}

export async function toggleSaveUniversity(token: string, uId: number) {
  const response = await fetch(`${API_BASE_URL}/saas/universities/${uId}/toggle`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to toggle save");
  return response.json();
}

export async function updateSavedUniversity(
  token: string,
  uId: number,
  data: { naesin_score?: number; memo?: string }
) {
  const response = await fetch(`${API_BASE_URL}/saas/universities/${uId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update");
  return response.json();
}

export async function checkIsSaved(token: string, uId: number) {
  const response = await fetch(`${API_BASE_URL}/saas/universities/${uId}/is-saved`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return { saved: false };
  return response.json();
}

// ========== Practical Records API ==========

export async function getPracticalRecords(token: string, event?: string) {
  const url = event
    ? `${API_BASE_URL}/saas/practical?event=${encodeURIComponent(event)}`
    : `${API_BASE_URL}/saas/practical`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to get records");
  return response.json();
}

export async function createPracticalRecord(
  token: string,
  data: { event_name: string; record?: string; record_date?: string; memo?: string }
) {
  const response = await fetch(`${API_BASE_URL}/saas/practical`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create record");
  return response.json();
}

export async function updatePracticalRecord(
  token: string,
  id: number,
  data: { record?: string; record_date?: string; memo?: string }
) {
  const response = await fetch(`${API_BASE_URL}/saas/practical/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update record");
  return response.json();
}

export async function deletePracticalRecord(token: string, id: number) {
  const response = await fetch(`${API_BASE_URL}/saas/practical/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to delete record");
  return response.json();
}
