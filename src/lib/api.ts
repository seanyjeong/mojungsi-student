import { ScoreForm, SingleCalculationResult, BatchCalculationResult } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8900";

// ========== Auth Fetch Wrapper ==========

/**
 * 인증이 필요한 API 호출용 fetch wrapper
 * 401 에러 시 자동으로 로그아웃 + 로그인 페이지로 리다이렉트
 */
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 401) {
    // 토큰 만료 - 로그아웃 처리
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      // auth-change 이벤트 발생시켜서 UI 업데이트
      window.dispatchEvent(new Event("auth-change"));

      // 현재 페이지가 로그인 콜백이 아니면 홈으로 리다이렉트
      if (!window.location.pathname.includes("/auth/")) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "/";
      }
    }
  }

  return response;
}

// ========== 활성 연도 API ==========

let cachedActiveYear: number | null = null;

export async function getActiveYear(): Promise<number> {
  // 캐시된 값이 있으면 반환
  if (cachedActiveYear !== null) {
    return cachedActiveYear;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/jungsi/active-year`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.activeYear) {
        cachedActiveYear = data.activeYear;
        return data.activeYear;
      }
    }
  } catch (error) {
    console.error("Failed to fetch active year:", error);
  }

  // 기본값
  return 2026;
}

export async function calculateScore(
  U_ID: number,
  scores: ScoreForm,
  year: number = 2026,
  examType?: string  // 3월, 6월, 9월, 수능
): Promise<SingleCalculationResult> {
  const response = await fetch(`${API_BASE_URL}/calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      U_ID,
      year,
      scores,
      basis_exam: examType,  // 해당 시험의 최고표점/변표 사용
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
  year: number = 2026,
  examType?: string  // 3월, 6월, 9월, 수능
): Promise<{ success: boolean; results: Array<{ U_ID: number; 환산점수: number }>; count: number }> {
  const response = await fetch(`${API_BASE_URL}/calculate/all`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      year,
      scores,
      basis_exam: examType,  // 해당 시험의 최고표점/변표 사용
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
  const response = await authFetch(`${API_BASE_URL}/saas/auth/me`, {
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
  const response = await authFetch(`${API_BASE_URL}/saas/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to get profile");
  return response.json();
}

export async function updateProfile(
  token: string,
  data: { name?: string; school?: string; grade?: string; gender?: string; calc_exam_type?: string }
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

export async function getScores(token: string) {
  const response = await authFetch(`${API_BASE_URL}/saas/scores`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to get scores");
  return response.json();
}

// ========== 가채점 관련 API ==========

export interface ActiveExamInfo {
  year: number;
  examType: string | null;
  mode: "gachaejeom" | "seongjeokpyo" | null;
  examDate?: string;
  releaseDate?: string;
  isForced: boolean;
}

export interface RawScoreInput {
  korean?: { subject: string; raw: number };
  math?: { subject: string; raw: number };
  english?: { raw: number };
  history?: { raw: number };
  inquiry1?: { subject: string; raw: number };
  inquiry2?: { subject: string; raw: number };
}

export interface ConvertedScores {
  korean?: { subject: string; std: number; pct: number; grade: number };
  math?: { subject: string; std: number; pct: number; grade: number };
  english?: { grade: number };
  history?: { grade: number };
  inquiry1?: { subject: string; std: number; pct: number; grade: number };
  inquiry2?: { subject: string; std: number; pct: number; grade: number };
}

/**
 * 현재 활성 시험 조회
 * GET /saas/scores/active-exam
 */
export async function getActiveExam(year?: number): Promise<ActiveExamInfo> {
  const params = year ? `?year=${year}` : "";
  const response = await fetch(`${API_BASE_URL}/saas/scores/active-exam${params}`);
  if (!response.ok) {
    // 기본값 반환
    return {
      year: year || new Date().getFullYear(),
      examType: null,
      mode: null,
      isForced: false,
    };
  }
  return response.json();
}

/**
 * 원점수 보간 (저장 없이 변환만)
 * POST /saas/scores/interpolate
 */
export async function interpolateScores(
  examType: string,
  rawScores: RawScoreInput,
  year?: number
): Promise<ConvertedScores> {
  const response = await fetch(`${API_BASE_URL}/saas/scores/interpolate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      examType,
      rawScores,
      year: year || 2026,
    }),
  });
  if (!response.ok) throw new Error("Failed to interpolate scores");
  return response.json();
}

/**
 * 가채점 성적 저장
 * POST /saas/scores/gachaejeom
 */
export async function saveGachaejeomScore(
  token: string,
  examType: string,
  rawScores: RawScoreInput,
  year?: number
) {
  const response = await fetch(`${API_BASE_URL}/saas/scores/gachaejeom`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      examType,
      rawScores,
      year: year || 2026,
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to save gachaejeom score");
  }
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
  const response = await authFetch(`${API_BASE_URL}/saas/universities/saved`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to get saved universities");
  return response.json();
}

export async function toggleSaveUniversity(token: string, uId: number, sunungScore?: number) {
  const response = await fetch(`${API_BASE_URL}/saas/universities/${uId}/toggle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sunung_score: sunungScore }),
  });
  if (!response.ok) throw new Error("Failed to toggle save");
  return response.json();
}

export async function updateSavedUniversity(
  token: string,
  uId: number,
  data: {
    naesin_score?: number;
    memo?: string;
    practical_score?: number;
    practical_records?: Array<{
      event: string;
      record: string;
      score?: number;
      deduction?: number;
    }>;
    exam_type?: string; // "3월" | "6월" | "9월" | "수능"
  }
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

// 실기 배점표 조회
export async function getPracticalScoreTable(
  token: string,
  uId: number,
  year: number = 2026,
  gender?: string
) {
  const params = new URLSearchParams({ year: String(year) });
  if (gender) params.append("gender", gender);

  const response = await fetch(
    `${API_BASE_URL}/saas/universities/${uId}/practical-scores?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) throw new Error("Failed to get practical scores");
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

// ========== Practical Event Types API ==========

export interface EventType {
  id: number;
  name: string;
  direction: "lower" | "higher";
  unit: string | null;
  display_order: number;
  is_default: boolean;
}

export async function getEventTypes(token: string): Promise<EventType[]> {
  const response = await fetch(`${API_BASE_URL}/saas/practical/event-types`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to get event types");
  return response.json();
}

export async function createEventType(
  token: string,
  data: { name: string; direction: "lower" | "higher"; unit?: string }
) {
  const response = await fetch(`${API_BASE_URL}/saas/practical/event-types`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create event type");
  return response.json();
}

export async function updateEventType(
  token: string,
  id: number,
  data: { name?: string; direction?: "lower" | "higher"; unit?: string }
) {
  const response = await fetch(`${API_BASE_URL}/saas/practical/event-types/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update event type");
  return response.json();
}

export async function deleteEventType(token: string, id: number) {
  const response = await fetch(`${API_BASE_URL}/saas/practical/event-types/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to delete event type");
  return response.json();
}

// 그래프용 히스토리 조회
export interface HistoryData {
  records: Array<{
    id: number;
    record: string | null;
    numeric_record: string | null;
    record_date: string | null;
    memo: string | null;
  }>;
  eventType: EventType | null;
  stats: {
    average: number;
    pb: number;
    current: number;
    count: number;
  } | null;
}

export async function getPracticalHistory(
  token: string,
  eventName: string
): Promise<HistoryData> {
  const response = await fetch(
    `${API_BASE_URL}/saas/practical/history/${encodeURIComponent(eventName)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) throw new Error("Failed to get history");
  return response.json();
}

// ========== 회원탈퇴 API ==========

export async function withdrawUser(token: string) {
  const response = await fetch(`${API_BASE_URL}/saas/auth/withdraw`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to withdraw");
  return response.json();
}

// ========== Notices API ==========

export interface Notice {
  id: number;
  title: string;
  content: string;
  type: "general" | "urgent" | "event";
  published_at: string | null;
  created_at: string;
  isRead?: boolean;
}

// 최신 공지 3개 (로그인 선택)
export async function getLatestNotices(token?: string): Promise<Notice[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}/saas/notices/latest`, { headers });
  if (!response.ok) return [];
  return response.json();
}

// 전체 공지 목록 (로그인 선택)
export async function getNotices(token?: string): Promise<Notice[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}/saas/notices`, { headers });
  if (!response.ok) return [];
  return response.json();
}

// 공지 상세 + 읽음 표시 (🔒)
export async function getNotice(token: string, id: number): Promise<Notice | null> {
  const response = await fetch(`${API_BASE_URL}/saas/notices/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  return response.json();
}

// 읽음 처리 (🔒)
export async function markNoticeAsRead(token: string, id: number): Promise<void> {
  await fetch(`${API_BASE_URL}/saas/notices/${id}/read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// 안읽은 공지 수 (🔒)
export async function getUnreadNoticeCount(token: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/saas/notices/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return 0;
  const data = await response.json();
  return data.count || 0;
}
