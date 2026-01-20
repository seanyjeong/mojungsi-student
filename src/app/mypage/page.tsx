"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getToken } from "@/lib/auth";
import { getProfile, updateProfile, getScores, saveScore, withdrawUser, getActiveYear, getActiveExam, interpolateScores, saveGachaejeomScore } from "@/lib/api";
import { ScoreForm } from "@/types";
import { User, Pencil, Save, Book, Calculator, Globe, Landmark, Search, AlertTriangle, X, CheckCircle, XCircle, Hand, Info, Zap, FileText, RefreshCw } from "lucide-react";

// DB 저장값과 화면 표시 라벨 매핑 (통일됨)
const EXAM_TYPES = [
  { value: "3월", label: "3월" },
  { value: "6월", label: "6월" },
  { value: "9월", label: "9월" },
  { value: "수능", label: "수능" },
];

const GRADE_OPTIONS = ["1", "2", "3", "N수"];

const 사회탐구 = ["생활과윤리", "윤리와사상", "한국지리", "세계지리", "동아시아사", "세계사", "정치와법", "경제", "사회문화"];
const 과학탐구 = ["물리학Ⅰ", "화학Ⅰ", "생명과학Ⅰ", "지구과학Ⅰ", "물리학Ⅱ", "화학Ⅱ", "생명과학Ⅱ", "지구과학Ⅱ"];
const 탐구과목 = [...사회탐구, ...과학탐구];

interface Profile {
  name?: string;
  school?: string;
  grade?: string;  // "1", "2", "3", "N수"
  gender?: string;
  nickname?: string;
  profileImage?: string;
}

interface ScoreData {
  국어_선택과목?: string;
  국어_원점수?: number;
  국어_표준점수?: number;
  국어_백분위?: number;
  국어_등급?: number;
  국어_미응시?: boolean;
  수학_선택과목?: string;
  수학_원점수?: number;
  수학_표준점수?: number;
  수학_백분위?: number;
  수학_등급?: number;
  수학_미응시?: boolean;
  영어_원점수?: number;
  영어_등급?: number;
  영어_미응시?: boolean;
  한국사_원점수?: number;
  한국사_등급?: number;
  한국사_미응시?: boolean;
  탐구1_선택과목?: string;
  탐구1_원점수?: number;
  탐구1_표준점수?: number;
  탐구1_백분위?: number;
  탐구1_등급?: number;
  탐구1_미응시?: boolean;
  탐구2_선택과목?: string;
  탐구2_원점수?: number;
  탐구2_표준점수?: number;
  탐구2_백분위?: number;
  탐구2_등급?: number;
  탐구2_미응시?: boolean;
  // 메타 데이터
  score_mode?: "가채점" | "성적표";
  gachaejeom_edit_count?: number;
  seongjeokpyo_edit_count?: number;
}

interface ActiveExamInfo {
  year: number;
  examType: string | null;
  mode: "gachaejeom" | "seongjeokpyo" | null;
  examDate?: string;
  releaseDate?: string;
  isForced: boolean;
}

// 예상 점수 타입
interface EstimatedScore {
  std?: number;
  pct?: number;
  grade?: number;
}

interface EstimatedScores {
  korean?: EstimatedScore;
  math?: EstimatedScore;
  english?: { grade?: number };
  history?: { grade?: number };
  inquiry1?: EstimatedScore;
  inquiry2?: EstimatedScore;
}

export default function MyPage() {
  const router = useRouter();
  const { user, isLoading, isLoggedIn, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"info" | "scores">("info");
  const [profile, setProfile] = useState<Profile>({});
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedExam, setSelectedExam] = useState("수능");
  const [calcExam, setCalcExam] = useState("수능"); // 계산에 사용할 시험
  const [scores, setScores] = useState<Record<string, ScoreData>>({});
  const [currentScore, setCurrentScore] = useState<ScoreData>({});
  const [scoreSaving, setScoreSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [modalProfile, setModalProfile] = useState<{ name: string; school: string; gender: string; grade: string }>({ name: "", school: "", gender: "", grade: "" });
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  // 가채점 관련 상태
  const [activeExamInfo, setActiveExamInfo] = useState<ActiveExamInfo | null>(null);
  const [inputMode, setInputMode] = useState<"gachaejeom" | "seongjeokpyo">("seongjeokpyo");
  const [estimatedScores, setEstimatedScores] = useState<EstimatedScores>({});
  const [isInterpolating, setIsInterpolating] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) {
      loadProfile();
      loadScores();
      loadActiveExam();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (scores[selectedExam]) {
      setCurrentScore(scores[selectedExam]);
    } else {
      setCurrentScore({});
    }
  }, [selectedExam, scores]);

  // 활성 시험 정보가 로드되면 선택된 시험 및 모드 업데이트
  useEffect(() => {
    if (activeExamInfo?.examType) {
      setSelectedExam(activeExamInfo.examType);
      if (activeExamInfo.mode) {
        setInputMode(activeExamInfo.mode);
      }
    }
  }, [activeExamInfo]);

  // 원점수 변경 시 실시간 보간 (가채점 모드에서만)
  useEffect(() => {
    if (inputMode === "gachaejeom") {
      debouncedInterpolate();
    }
  }, [
    inputMode,
    currentScore.국어_선택과목,
    currentScore.국어_원점수,
    currentScore.수학_선택과목,
    currentScore.수학_원점수,
    currentScore.영어_원점수,
    currentScore.한국사_원점수,
    currentScore.탐구1_선택과목,
    currentScore.탐구1_원점수,
    currentScore.탐구2_선택과목,
    currentScore.탐구2_원점수,
  ]);

  const loadProfile = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await getProfile(token);
      const loadedProfile = {
        name: data.name || "",
        school: data.school || "",
        grade: data.grade || "",
        gender: data.gender || "",
        nickname: data.nickname || "",
        profileImage: data.profile_image || "",
      };
      setProfile(loadedProfile);
      // 계산용 시험 타입 로드 (DB에서)
      setCalcExam(data.calc_exam_type || "수능");

      // 성별 또는 학년이 없으면 모달 표시
      if (!loadedProfile.gender || !loadedProfile.grade) {
        // 카카오 닉네임을 이름 기본값으로 설정
        setModalProfile({
          name: loadedProfile.name || loadedProfile.nickname || "",
          school: loadedProfile.school || "",
          gender: loadedProfile.gender || "",
          grade: loadedProfile.grade || "",
        });
        setShowProfileModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadScores = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await getScores(token);
      const map: Record<string, ScoreData> = {};
      data.forEach((s: any) => {
        map[s.exam_type] = {
          ...(s.scores || {}),
          score_mode: s.score_mode,
          gachaejeom_edit_count: s.gachaejeom_edit_count,
          seongjeokpyo_edit_count: s.seongjeokpyo_edit_count,
        };
      });
      setScores(map);
    } catch (err) {
      console.error(err);
    }
  };

  const loadActiveExam = async () => {
    try {
      const data = await getActiveExam();
      setActiveExamInfo(data);
    } catch (err) {
      console.error("Failed to load active exam:", err);
    }
  };

  // 실시간 보간 (디바운스 적용)
  const debouncedInterpolate = useCallback(
    debounce(async () => {
      if (inputMode !== "gachaejeom") return;

      const rawScores = buildRawScoresPayload(currentScore);
      if (!hasAnyRawScore(rawScores)) {
        setEstimatedScores({});
        return;
      }

      setIsInterpolating(true);
      try {
        const activeYear = await getActiveYear();
        const result = await interpolateScores(selectedExam, rawScores, activeYear);
        setEstimatedScores(result);
      } catch (err) {
        console.error("Interpolation failed:", err);
      } finally {
        setIsInterpolating(false);
      }
    }, 500),
    [currentScore, inputMode, selectedExam]
  );

  const handleSaveProfile = async () => {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      await updateProfile(token, {
        name: profile.name,
        school: profile.school,
        grade: profile.grade,
        gender: profile.gender,
      });
      setEditMode(false);
      setMessage("프로필이 저장되었습니다!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("프로필 저장에 실패했습니다");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  // 모달에서 필수 정보 저장
  const handleSaveRequiredProfile = async () => {
    if (!modalProfile.gender || !modalProfile.grade) {
      setMessage("성별과 학년을 모두 선택해주세요");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      await updateProfile(token, {
        name: modalProfile.name,
        school: modalProfile.school,
        gender: modalProfile.gender,
        grade: modalProfile.grade,
      });
      setProfile(p => ({
        ...p,
        name: modalProfile.name,
        school: modalProfile.school,
        gender: modalProfile.gender,
        grade: modalProfile.grade,
      }));
      setShowProfileModal(false);
      setMessage("정보가 저장되었습니다!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("저장에 실패했습니다");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  // 회원탈퇴
  const handleWithdraw = async () => {
    const token = getToken();
    if (!token) return;
    setWithdrawing(true);
    try {
      await withdrawUser(token);
      logout();
      router.push("/");
    } catch (err) {
      setMessage("회원탈퇴에 실패했습니다");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setWithdrawing(false);
      setShowWithdrawConfirm(false);
    }
  };

  // 한글 형식을 ScoreForm 형식으로 변환
  const convertToScoreForm = (data: ScoreData): ScoreForm => {
    return {
      korean: {
        subject: data.국어_선택과목 || "화법과작문",
        std: data.국어_표준점수 || 0,
        pct: data.국어_백분위 || 0,
        grade: data.국어_등급 || 0,
      },
      math: {
        subject: data.수학_선택과목 || "미적분",
        std: data.수학_표준점수 || 0,
        pct: data.수학_백분위 || 0,
        grade: data.수학_등급 || 0,
      },
      english: {
        grade: data.영어_등급 || 5,
      },
      history: {
        grade: data.한국사_등급 || 4,
      },
      inquiry1: {
        subject: data.탐구1_선택과목 || "",
        std: data.탐구1_표준점수 || 0,
        pct: data.탐구1_백분위 || 0,
        grade: data.탐구1_등급 || 0,
      },
      inquiry2: {
        subject: data.탐구2_선택과목 || "",
        std: data.탐구2_표준점수 || 0,
        pct: data.탐구2_백분위 || 0,
        grade: data.탐구2_등급 || 0,
      },
    };
  };

  // 성적 저장
  const handleSaveScore = async () => {
    const token = getToken();
    if (!token) return;
    setScoreSaving(true);
    try {
      const activeYear = await getActiveYear();

      if (inputMode === "gachaejeom") {
        // 가채점 저장
        const rawScores = buildRawScoresPayload(currentScore);
        await saveGachaejeomScore(token, selectedExam, rawScores, activeYear);
      } else {
        // 성적표 저장
        await saveScore(token, selectedExam, currentScore, activeYear);
      }

      setScores(prev => ({ ...prev, [selectedExam]: currentScore }));
      setMessage("성적이 저장되었습니다!");
      setTimeout(() => setMessage(""), 3000);

      // 성적 재로드 (edit_count 업데이트)
      loadScores();
    } catch (err: any) {
      if (err.message?.includes("수정 횟수")) {
        setMessage("수정 횟수를 초과했습니다 (최대 2회)");
      } else {
        setMessage("저장에 실패했습니다");
      }
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setScoreSaving(false);
    }
  };

  // 계산에 사용할 시험 변경
  const handleSetCalcExam = async (exam: string) => {
    const token = getToken();
    if (!token) return;

    setCalcExam(exam);
    try {
      await updateProfile(token, { calc_exam_type: exam });
      setMessage(`"${EXAM_TYPES.find(e => e.value === exam)?.label || exam}" 성적으로 계산합니다!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save calc exam type:", err);
    }
  };

  // 현재 시험이 활성 시험인지 확인
  const isActiveExam = useMemo(() => {
    if (!activeExamInfo?.examType) return false;
    return selectedExam === activeExamInfo.examType;
  }, [activeExamInfo, selectedExam]);

  // 해당 시험의 모드 가져오기
  const getExamMode = useCallback((examValue: string): "gachaejeom" | "seongjeokpyo" | null => {
    if (!activeExamInfo?.examType) return null;
    if (examValue === activeExamInfo.examType) {
      return activeExamInfo.mode;
    }
    // 활성 시험이 아니면 성적표 모드
    return "seongjeokpyo";
  }, [activeExamInfo]);

  // 수정 횟수 표시
  const getEditCountDisplay = useCallback((examValue: string) => {
    const scoreData = scores[examValue];
    if (!scoreData) return null;

    const gachaejeomCount = scoreData.gachaejeom_edit_count || 0;
    const seongjeokpyoCount = scoreData.seongjeokpyo_edit_count || 0;

    return { gachaejeom: gachaejeomCount, seongjeokpyo: seongjeokpyoCount };
  }, [scores]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <User className="w-16 h-16 text-zinc-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
        <p className="text-zinc-500 mb-4">내 정보 확인을 위해<br />로그인해 주세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur">
            {profile.name?.charAt(0) || user?.nickname?.charAt(0) || "?"}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name || user?.nickname || "이름 미입력"}</h2>
            <p className="text-white/80 text-sm">{profile.school || "학교 정보 없음"}</p>
          </div>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === "info"
              ? "bg-white dark:bg-zinc-700 shadow text-blue-600 dark:text-blue-400"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          내 정보
        </button>
        <button
          onClick={() => setActiveTab("scores")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === "scores"
              ? "bg-white dark:bg-zinc-700 shadow text-blue-600 dark:text-blue-400"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          성적 관리
        </button>
      </div>

      {/* Toast Notification */}
      {message && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl text-base font-semibold transform transition-all duration-300 flex items-center gap-2 ${
          message.includes("실패") || message.includes("초과")
            ? "bg-gradient-to-r from-red-500 to-rose-500 text-white"
            : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
        }`}>
          {message.includes("실패") || message.includes("초과") ? (
            <XCircle className="w-5 h-5" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          {message}
        </div>
      )}

      {/* Info Tab */}
      {activeTab === "info" && (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> 내 정보
            </h3>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="text-blue-500 text-sm flex items-center gap-1"
              >
                <Pencil className="w-4 h-4" /> 수정
              </button>
            ) : (
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
              >
                <Save className="w-4 h-4" /> {saving ? "저장중..." : "저장"}
              </button>
            )}
          </div>

          <div className="space-y-3">
            <InfoRow label="이름" value={profile.name} editMode={editMode}
              onChange={(v) => setProfile(p => ({ ...p, name: v }))} />
            <InfoRow label="학교/학원" value={profile.school} editMode={editMode}
              onChange={(v) => setProfile(p => ({ ...p, school: v }))} placeholder="학교 또는 체대입시학원" />

            {/* 학년 - 선택식 */}
            <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-700">
              <span className="text-zinc-500 text-sm">학년 <span className="text-red-500">*</span></span>
              {editMode ? (
                <select
                  value={profile.grade || ""}
                  onChange={(e) => setProfile(p => ({ ...p, grade: e.target.value }))}
                  className="text-sm border rounded-lg px-2 py-1 dark:bg-zinc-700 dark:border-zinc-600"
                >
                  <option value="">선택</option>
                  {GRADE_OPTIONS.map(g => (
                    <option key={g} value={g}>{g === "N수" ? "N수" : `${g}학년`}</option>
                  ))}
                </select>
              ) : (
                <span className="font-medium">
                  {profile.grade ? (profile.grade === "N수" ? "N수" : `${profile.grade}학년`) : "미입력"}
                </span>
              )}
            </div>

            {/* 성별 */}
            <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-700">
              <span className="text-zinc-500 text-sm">성별 <span className="text-red-500">*</span></span>
              {editMode ? (
                <select
                  value={profile.gender || ""}
                  onChange={(e) => setProfile(p => ({ ...p, gender: e.target.value }))}
                  className="text-sm border rounded-lg px-2 py-1 dark:bg-zinc-700 dark:border-zinc-600"
                >
                  <option value="">선택</option>
                  <option value="남">남</option>
                  <option value="여">여</option>
                </select>
              ) : (
                <span className="font-medium">{profile.gender || "미입력"}</span>
              )}
            </div>
          </div>

          {/* 회원탈퇴 */}
          <button
            onClick={() => setShowWithdrawConfirm(true)}
            className="w-full mt-6 py-3 text-zinc-400 text-sm hover:text-red-500 transition"
          >
            회원탈퇴
          </button>
        </div>
      )}

      {/* Scores Tab */}
      {activeTab === "scores" && (
        <div className="space-y-4">
          {/* 안내 문구 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium">한국교육과정평가원 주관 시험만 입력 가능합니다</p>
              {inputMode === "gachaejeom" && isActiveExam && (
                <p className="mt-1 text-blue-600 dark:text-blue-400">
                  예상 점수는 등급컷 기반 추정치입니다
                </p>
              )}
            </div>
          </div>

          {/* Exam Type Selector with Mode Indicator */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-zinc-500 mb-3">성적 입력할 시험 선택</p>
            <div className="grid grid-cols-4 gap-2">
              {EXAM_TYPES.map((exam) => {
                const examMode = getExamMode(exam.value);
                const isActive = activeExamInfo?.examType === exam.value;
                const editCounts = getEditCountDisplay(exam.value);

                return (
                  <button
                    key={exam.value}
                    onClick={() => {
                      setSelectedExam(exam.value);
                      if (examMode) {
                        setInputMode(examMode);
                      }
                    }}
                    className={`relative px-3 py-2 rounded-xl text-sm font-medium transition ${
                      selectedExam === exam.value
                        ? "bg-blue-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <span>{exam.label}</span>
                    {isActive && (
                      <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                        examMode === "gachaejeom" ? "bg-amber-400" : "bg-green-400"
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* 모드 표시 및 전환 */}
            {isActiveExam && activeExamInfo?.mode && (
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-zinc-500">입력 모드</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInputMode("gachaejeom")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        inputMode === "gachaejeom"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500"
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      가채점
                    </button>
                    <button
                      onClick={() => setInputMode("seongjeokpyo")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        inputMode === "seongjeokpyo"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      성적표
                    </button>
                  </div>
                </div>

                {/* 수정 횟수 표시 */}
                {(() => {
                  const counts = getEditCountDisplay(selectedExam);
                  if (!counts) return null;
                  const currentCount = inputMode === "gachaejeom" ? counts.gachaejeom : counts.seongjeokpyo;
                  const remaining = 2 - currentCount;
                  return (
                    <p className={`text-xs ${remaining <= 0 ? "text-red-500" : "text-zinc-400"}`}>
                      {inputMode === "gachaejeom" ? "가채점" : "성적표"} 수정 가능 횟수: {remaining}회 남음
                    </p>
                  );
                })()}
              </div>
            )}

            {/* 성적표 미입력 안내 */}
            {!isActiveExam && activeExamInfo?.mode === "seongjeokpyo" && !scores[selectedExam] && (
              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
                <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  성적표를 입력하세요
                </p>
              </div>
            )}

            {/* 계산에 사용할 시험 선택 */}
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
              <p className="text-sm text-zinc-500 mb-3 flex items-center gap-1.5">
                <Calculator className="w-4 h-4" /> 계산에 사용할 시험
              </p>
              <div className="grid grid-cols-4 gap-2">
                {EXAM_TYPES.map((exam) => (
                  <button
                    key={exam.value}
                    onClick={() => handleSetCalcExam(exam.value)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition ${
                      calcExam === exam.value
                        ? "bg-green-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {exam.label} {calcExam === exam.value && <span className="ml-0.5">&#10003;</span>}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                대학검색에서 {EXAM_TYPES.find(e => e.value === calcExam)?.label || calcExam} 성적으로 계산
              </p>
            </div>
          </div>

          {/* Score Input Cards */}
          <ScoreCard
            title="국어"
            icon={<Book className="w-4 h-4" />}
            color="red"
            score={currentScore}
            setScore={setCurrentScore}
            subjectKey="국어"
            subjectOptions={["화법과작문", "언어와매체"]}
            inputMode={inputMode}
            estimatedScore={estimatedScores.korean}
            isInterpolating={isInterpolating}
          />

          <ScoreCard
            title="수학"
            icon={<Calculator className="w-4 h-4" />}
            color="teal"
            score={currentScore}
            setScore={setCurrentScore}
            subjectKey="수학"
            subjectOptions={["확률과통계", "미적분", "기하"]}
            inputMode={inputMode}
            estimatedScore={estimatedScores.math}
            isInterpolating={isInterpolating}
          />

          <ScoreCard
            title="영어"
            icon={<Globe className="w-4 h-4" />}
            color="yellow"
            score={currentScore}
            setScore={setCurrentScore}
            subjectKey="영어"
            noSubject
            noStandardScore
            inputMode={inputMode}
            estimatedScore={estimatedScores.english}
            isInterpolating={isInterpolating}
            isAbsoluteGrade
          />

          <ScoreCard
            title="한국사"
            icon={<Landmark className="w-4 h-4" />}
            color="orange"
            score={currentScore}
            setScore={setCurrentScore}
            subjectKey="한국사"
            noSubject
            noStandardScore
            inputMode={inputMode}
            estimatedScore={estimatedScores.history}
            isInterpolating={isInterpolating}
            isAbsoluteGrade
          />

          <ScoreCard
            title="탐구1"
            icon={<Search className="w-4 h-4" />}
            color="purple"
            score={currentScore}
            setScore={setCurrentScore}
            subjectKey="탐구1"
            subjectOptions={탐구과목}
            fullWidthSubject
            grouped
            inputMode={inputMode}
            estimatedScore={estimatedScores.inquiry1}
            isInterpolating={isInterpolating}
          />

          <ScoreCard
            title="탐구2"
            icon={<Search className="w-4 h-4" />}
            color="blue"
            score={currentScore}
            setScore={setCurrentScore}
            subjectKey="탐구2"
            subjectOptions={탐구과목}
            fullWidthSubject
            grouped
            excludeSubject={currentScore.탐구1_선택과목}
            inputMode={inputMode}
            estimatedScore={estimatedScores.inquiry2}
            isInterpolating={isInterpolating}
          />

          <button
            onClick={handleSaveScore}
            disabled={scoreSaving}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
          >
            {scoreSaving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {inputMode === "gachaejeom" ? "가채점 저장하기" : "성적 저장하기"}
              </>
            )}
          </button>
        </div>
      )}

      {/* 필수 정보 입력 모달 */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              환영합니다! <Hand className="w-5 h-5 text-yellow-500" />
            </h3>
            <p className="text-sm text-zinc-500 mb-6">
              서비스 이용을 위해 아래 정보를 입력해주세요.
            </p>

            <div className="space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={modalProfile.name}
                  onChange={(e) => setModalProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="이름을 입력하세요"
                  className="w-full px-4 py-3 border rounded-xl text-sm bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600"
                />
              </div>

              {/* 학교 또는 체대입시학원 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  학교 또는 체대입시학원
                </label>
                <input
                  type="text"
                  value={modalProfile.school}
                  onChange={(e) => setModalProfile(p => ({ ...p, school: e.target.value }))}
                  placeholder="예: OO고등학교, OO체대입시학원"
                  className="w-full px-4 py-3 border rounded-xl text-sm bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600"
                />
              </div>

              {/* 성별 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  성별 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {["남", "여"].map((g) => (
                    <button
                      key={g}
                      onClick={() => setModalProfile(p => ({ ...p, gender: g }))}
                      className={`flex-1 py-3 rounded-xl font-medium transition ${
                        modalProfile.gender === g
                          ? "bg-blue-500 text-white"
                          : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* 학년 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  학년 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  {GRADE_OPTIONS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setModalProfile(p => ({ ...p, grade: g }))}
                      className={`flex-1 py-3 rounded-xl font-medium transition ${
                        modalProfile.grade === g
                          ? "bg-blue-500 text-white"
                          : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {g === "N수" ? "N수" : g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveRequiredProfile}
              disabled={saving || !modalProfile.gender || !modalProfile.grade}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl disabled:opacity-50 transition"
            >
              {saving ? "저장 중..." : "시작하기"}
            </button>
          </div>
        </div>
      )}

      {/* 회원탈퇴 확인 모달 */}
      {showWithdrawConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold">회원탈퇴</h3>
                <p className="text-sm text-zinc-500">정말 탈퇴하시겠습니까?</p>
              </div>
            </div>

            <p className="text-sm text-zinc-500 mb-6 bg-zinc-50 dark:bg-zinc-700/50 p-3 rounded-lg">
              탈퇴 시 모든 데이터(성적, 저장한 대학, 실기 기록)가 <span className="text-red-500 font-medium">영구 삭제</span>되며 복구할 수 없습니다.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawConfirm(false)}
                className="flex-1 py-3 border border-zinc-300 dark:border-zinc-600 rounded-xl font-medium transition hover:bg-zinc-50 dark:hover:bg-zinc-700"
              >
                취소
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium transition hover:bg-red-600 disabled:opacity-50"
              >
                {withdrawing ? "처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  editMode,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value?: string;
  editMode: boolean;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-700">
      <span className="text-zinc-500 text-sm">{label}</span>
      {editMode ? (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-sm border rounded-lg px-2 py-1 w-40 text-right dark:bg-zinc-700 dark:border-zinc-600"
        />
      ) : (
        <span className="font-medium">{value || "미입력"}</span>
      )}
    </div>
  );
}

function ScoreCard({
  title,
  icon,
  color,
  score,
  setScore,
  subjectKey,
  subjectOptions,
  noSubject,
  noStandardScore,
  fullWidthSubject,
  grouped,
  excludeSubject,
  inputMode,
  estimatedScore,
  isInterpolating,
  isAbsoluteGrade,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  score: ScoreData;
  setScore: (fn: (s: ScoreData) => ScoreData) => void;
  subjectKey: string;
  subjectOptions?: string[];
  noSubject?: boolean;
  noStandardScore?: boolean;
  fullWidthSubject?: boolean;
  grouped?: boolean;
  excludeSubject?: string;
  inputMode: "gachaejeom" | "seongjeokpyo";
  estimatedScore?: { std?: number; pct?: number; grade?: number };
  isInterpolating?: boolean;
  isAbsoluteGrade?: boolean;
}) {
  const colorMap: Record<string, string> = {
    red: "border-l-red-500 text-red-600",
    teal: "border-l-teal-500 text-teal-600",
    yellow: "border-l-yellow-500 text-yellow-600",
    orange: "border-l-orange-500 text-orange-600",
    purple: "border-l-purple-500 text-purple-600",
    blue: "border-l-blue-500 text-blue-600",
  };

  const getValue = (key: string) => (score as any)[`${subjectKey}_${key}`] ?? "";
  const setValue = (key: string, val: any) => {
    setScore((s) => ({ ...s, [`${subjectKey}_${key}`]: val === "" ? undefined : val }));
  };

  // 미응시 상태 확인
  const isSkipped = getValue("미응시") === true;
  const toggleSkip = () => {
    if (isSkipped) {
      // 미응시 해제
      setValue("미응시", undefined);
    } else {
      // 미응시 설정 - 모든 값 초기화
      setScore((s) => ({
        ...s,
        [`${subjectKey}_미응시`]: true,
        [`${subjectKey}_선택과목`]: undefined,
        [`${subjectKey}_원점수`]: undefined,
        [`${subjectKey}_표준점수`]: undefined,
        [`${subjectKey}_백분위`]: undefined,
        [`${subjectKey}_등급`]: undefined,
      }));
    }
  };

  // 과목 필터링 (excludeSubject 제외)
  const filteredOptions = subjectOptions?.filter(opt => opt !== excludeSubject);

  // 가채점 모드인지 확인
  const isGachaejeomMode = inputMode === "gachaejeom";

  return (
    <div className={`bg-white dark:bg-zinc-800 rounded-xl p-4 border-l-4 ${colorMap[color]} shadow-sm ${isSkipped ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-semibold flex items-center gap-2 ${colorMap[color].split(" ")[1]}`}>
          {icon} {title}
          {isGachaejeomMode && !isAbsoluteGrade && (
            <span className="text-xs font-normal text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
              가채점
            </span>
          )}
        </h4>
        <button
          onClick={toggleSkip}
          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
            isSkipped
              ? "bg-zinc-500 text-white"
              : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500"
          }`}
        >
          {isSkipped ? "미응시" : "미응시"}
        </button>
      </div>

      {!isSkipped && (
        <div className="grid grid-cols-2 gap-3">
          {!noSubject && filteredOptions && (
            <div className={fullWidthSubject ? "col-span-2" : ""}>
              <label className="text-xs text-zinc-500 mb-1 block">선택과목</label>
              {grouped ? (
                <select
                  value={getValue("선택과목")}
                  onChange={(e) => setValue("선택과목", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600"
                >
                  <option value="">선택하세요</option>
                  <optgroup label="사회탐구">
                    {사회탐구.filter(s => s !== excludeSubject).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </optgroup>
                  <optgroup label="과학탐구">
                    {과학탐구.filter(s => s !== excludeSubject).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </optgroup>
                </select>
              ) : (
                <select
                  value={getValue("선택과목")}
                  onChange={(e) => setValue("선택과목", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600"
                >
                  <option value="">선택하세요</option>
                  {filteredOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* 원점수 입력 (가채점 모드 또는 절대평가 과목) */}
          {(isGachaejeomMode || isAbsoluteGrade) && (
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">원점수</label>
              <input
                type="number"
                value={getValue("원점수")}
                onChange={(e) => setValue("원점수", e.target.value ? parseInt(e.target.value) : "")}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600"
                placeholder={isAbsoluteGrade ? (subjectKey === "영어" ? "0~100" : "0~50") : "원점수"}
              />
            </div>
          )}

          {/* 가채점 모드: 예상 점수 표시 */}
          {isGachaejeomMode && !noStandardScore && (
            <>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">예상 표준점수</label>
                <div className={`w-full px-3 py-2 border rounded-lg text-sm bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-center font-medium ${isInterpolating ? "animate-pulse" : ""}`}>
                  {estimatedScore?.std ?? "-"}
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">예상 백분위</label>
                <div className={`w-full px-3 py-2 border rounded-lg text-sm bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-center font-medium ${isInterpolating ? "animate-pulse" : ""}`}>
                  {estimatedScore?.pct ?? "-"}
                </div>
              </div>
            </>
          )}

          {/* 가채점 모드: 예상 등급 표시 */}
          {isGachaejeomMode && (
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">예상 등급</label>
              <div className={`w-full px-3 py-2 border rounded-lg text-sm bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-center font-medium ${isInterpolating ? "animate-pulse" : ""}`}>
                {estimatedScore?.grade ?? "-"}
              </div>
            </div>
          )}

          {/* 성적표 모드: 직접 입력 */}
          {!isGachaejeomMode && (
            <>
              {!noStandardScore && (
                <>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">표준점수</label>
                    <input
                      type="number"
                      value={getValue("표준점수")}
                      onChange={(e) => setValue("표준점수", e.target.value ? parseInt(e.target.value) : "")}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">백분위</label>
                    <input
                      type="number"
                      value={getValue("백분위")}
                      onChange={(e) => setValue("백분위", e.target.value ? parseInt(e.target.value) : "")}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">등급</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={getValue("등급")}
                  onChange={(e) => setValue("등급", e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600"
                />
              </div>
            </>
          )}
        </div>
      )}

      {isSkipped && (
        <p className="text-sm text-zinc-400 text-center py-4">이 과목은 미응시로 처리됩니다</p>
      )}
    </div>
  );
}

// 유틸리티 함수들

// 디바운스 함수
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// 원점수 페이로드 빌드
function buildRawScoresPayload(score: ScoreData) {
  const payload: any = {};

  if (score.국어_선택과목 && score.국어_원점수 !== undefined) {
    payload.korean = {
      subject: score.국어_선택과목,
      raw: score.국어_원점수,
    };
  }

  if (score.수학_선택과목 && score.수학_원점수 !== undefined) {
    payload.math = {
      subject: score.수학_선택과목,
      raw: score.수학_원점수,
    };
  }

  if (score.영어_원점수 !== undefined) {
    payload.english = {
      raw: score.영어_원점수,
    };
  }

  if (score.한국사_원점수 !== undefined) {
    payload.history = {
      raw: score.한국사_원점수,
    };
  }

  if (score.탐구1_선택과목 && score.탐구1_원점수 !== undefined) {
    payload.inquiry1 = {
      subject: score.탐구1_선택과목,
      raw: score.탐구1_원점수,
    };
  }

  if (score.탐구2_선택과목 && score.탐구2_원점수 !== undefined) {
    payload.inquiry2 = {
      subject: score.탐구2_선택과목,
      raw: score.탐구2_원점수,
    };
  }

  return payload;
}

// 원점수가 하나라도 있는지 확인
function hasAnyRawScore(rawScores: any): boolean {
  return !!(
    rawScores.korean ||
    rawScores.math ||
    rawScores.english ||
    rawScores.history ||
    rawScores.inquiry1 ||
    rawScores.inquiry2
  );
}
