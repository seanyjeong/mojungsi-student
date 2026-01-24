"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getToken, useRequireProfile } from "@/lib/auth";
import {
  getSavedUniversities,
  toggleSaveUniversity,
  updateSavedUniversity,
  getPracticalScoreTable,
  getProfile,
  getActiveYear,
  getScores,
  calculateScore,
} from "@/lib/api";
import {
  calculatePracticalScore,
  PracticalConfig,
  ScoreRow,
  EventRecord,
} from "@/lib/practical-calc";
import { ScoreForm } from "@/types";
import { Heart, MapPin, X, Save, Loader2, Share2, TableProperties, AlertCircle } from "lucide-react";

// DB 형식(한글)을 API 형식(ScoreForm)으로 변환
function convertDbScoresToScoreForm(data: any): ScoreForm {
  // 이미 영어 키 형식이면 그대로 반환
  if (data.korean || data.math) {
    return data as ScoreForm;
  }
  // 한글 키 형식이면 변환
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
}
import { shareScore, initKakao } from "@/lib/kakao-share";
import ScoreTableModal from "@/components/ScoreTableModal";
import UniversityLogo from "@/components/UniversityLogo";

interface CutoffInfo {
  expected_sunung_cut: number | null;
  expected_total_cut: number | null;
  prev_sunung_cut: number | null;
  prev_total_cut: number | null;
}

interface PracticalByExam {
  [examType: string]: {
    score: number;
    events: EventRecord[];
  } | null;
}

interface SavedUniversity {
  id: number;
  U_ID: number;
  sunung_score: number | null;
  naesin_score: number | null;
  practical_score: number | null;
  practical_records: EventRecord[] | null;
  practical_by_exam?: PracticalByExam | null; // 시험별 실기점수
  memo: string | null;
  university: {
    U_NM: string;
    D_NM: string;
    지역: string;
    모집인원: number;
    모집군: string;
    실기종목: string;
    수능반영비율: number;
    내신반영비율: number;
    실기반영비율: number;
    isWomensUniv?: boolean;
    단계별?: string | null;
    is_relative_eval?: boolean;
    practical_mode?: string;
    practical_total?: number;
    table_max_sum?: number;
    deduction_unit?: number;
    cutoff?: CutoffInfo | null;
  };
}

interface PracticalScoreData {
  events: string[];
  scoreTable: Record<string, ScoreRow[]>;
  units?: Record<string, { unit: string; direction: string }>;
  practicalMode: "basic" | "special";
  practicalTotal: number;
  baseScore: number;
  failHandling: string;
  specialConfig: any;
}

interface SavedScore {
  id: number;
  exam_type: string;
  scores: ScoreForm;
  year: number;
}

// 시험별 계산된 점수 (실시간 계산 결과 캐싱)
interface CalculatedScores {
  [examType: string]: {
    [U_ID: number]: number | null;
  };
}

const TABS = ["가군", "나군", "다군"] as const;
type TabType = (typeof TABS)[number];

const EXAM_TYPES = ["3월", "6월", "9월", "수능"] as const;
type ExamType = (typeof EXAM_TYPES)[number];

// 합격컷 표시 컴포넌트
function CutoffDisplay({
  cutoff,
  sunungScore,
  isRelativeEval,
  stepType,
  practicalMode,
  practicalTotal,
  tableMaxSum,
  deductionUnit,
}: {
  cutoff: CutoffInfo;
  sunungScore: number | null;
  isRelativeEval: boolean;
  stepType: number;
  practicalMode: string;
  practicalTotal: number;
  tableMaxSum: number;
  deductionUnit: number;
}) {
  const isStep = stepType > 0;

  // 상대평가 + 일괄합산: 표시 안함
  if (isRelativeEval && !isStep) {
    return null;
  }

  // 상대평가 + 1단계: 수능컷만 표시
  if (isRelativeEval && isStep) {
    if (!cutoff.expected_sunung_cut) return null;
    const meetsCut = sunungScore !== null && sunungScore >= cutoff.expected_sunung_cut;
    return (
      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">1단계 수능컷</span>
          <span className="font-semibold">{cutoff.expected_sunung_cut}점</span>
          {sunungScore !== null && (
            meetsCut ? (
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                1단계 통과 예상
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">
                {(cutoff.expected_sunung_cut - sunungScore).toFixed(0)}점 부족
              </span>
            )
          )}
        </div>
      </div>
    );
  }

  // 절대평가: 총점컷 기준 감수 표시
  if (!cutoff.expected_total_cut) return null;

  // special 모드: 복잡한 공식이라 예상컷만 표시 (추후 개선)
  if (practicalMode === 'special') {
    const requiredPractical = sunungScore !== null
      ? cutoff.expected_total_cut - sunungScore
      : null;
    return (
      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">예상컷</span>
          <span className="font-semibold">{cutoff.expected_total_cut}점</span>
          {requiredPractical !== null && requiredPractical > 0 && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              (실기 {requiredPractical.toFixed(0)}점 이상)
            </span>
          )}
        </div>
      </div>
    );
  }

  // basic 모드: 배점표 기반 감수 계산
  if (sunungScore !== null && practicalTotal > 0 && tableMaxSum > 0 && deductionUnit > 0) {
    const requiredPractical = cutoff.expected_total_cut - sunungScore;

    if (requiredPractical <= 0) {
      return (
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              수능만으로 합격권!
            </span>
          </div>
        </div>
      );
    }

    // 필요 실기점수(환산) → 배점표 점수로 역산
    // 환산공식: finalScore = (rawScore / tableMaxSum) * practicalTotal
    // 역산: rawScore = finalScore * tableMaxSum / practicalTotal
    const requiredRawScore = (requiredPractical * tableMaxSum) / practicalTotal;

    // 배점표 만점에서 필요점수 빼면 여유 점수
    const marginRaw = tableMaxSum - requiredRawScore;

    // 배점표 기반 감수 계산 (1감 = deductionUnit점)
    const deduction = marginRaw > 0 ? Math.floor(marginRaw / deductionUnit) : 0;

    return (
      <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          {deduction > 0 ? (
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
              {deduction}감 이내면 합격권!
            </span>
          ) : (
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              만점 필요
            </span>
          )}
          {isStep && cutoff.expected_sunung_cut && sunungScore >= cutoff.expected_sunung_cut && (
            <span className="text-xs text-green-600 dark:text-green-400">(1단계 통과)</span>
          )}
        </div>
      </div>
    );
  }

  // 수능점수 없으면 컷 정보만 표시
  return (
    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">예상컷</span>
        <span className="font-semibold">{cutoff.expected_total_cut}점</span>
        {isStep && cutoff.expected_sunung_cut && (
          <span className="text-xs text-zinc-400">
            (1단계 {cutoff.expected_sunung_cut}점)
          </span>
        )}
      </div>
    </div>
  );
}

export default function MyUniversitiesPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  useRequireProfile();
  const [saved, setSaved] = useState<SavedUniversity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUniv, setSelectedUniv] = useState<SavedUniversity | null>(
    null
  );
  const [selectedUnivForTable, setSelectedUnivForTable] = useState<SavedUniversity | null>(
    null
  );
  const [userGender, setUserGender] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("가군");

  // 시험 토글 관련 상태
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [savedScores, setSavedScores] = useState<SavedScore[]>([]);
  const [calculatedScores, setCalculatedScores] = useState<CalculatedScores>({});
  const [calculating, setCalculating] = useState(false);
  const [activeYear, setActiveYear] = useState<number>(2026);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  // 저장된 성적 로드 후, 첫 번째 가능한 시험 선택
  useEffect(() => {
    if (savedScores.length > 0 && selectedExam === null) {
      // 수능 → 9월 → 6월 → 3월 순으로 우선순위
      const priority: ExamType[] = ["수능", "9월", "6월", "3월"];
      for (const exam of priority) {
        if (savedScores.some(s => s.exam_type === exam)) {
          setSelectedExam(exam);
          return;
        }
      }
      // 우선순위에 없으면 첫 번째 성적 사용
      const firstExam = savedScores[0]?.exam_type as ExamType;
      if (firstExam && EXAM_TYPES.includes(firstExam)) {
        setSelectedExam(firstExam);
      }
    }
  }, [savedScores, selectedExam]);

  // 선택한 시험의 성적이 있는지 확인
  const selectedExamScore = useMemo(() => {
    if (!selectedExam) return null;
    return savedScores.find(s => s.exam_type === selectedExam)?.scores || null;
  }, [savedScores, selectedExam]);

  // 페이지 로드 시 모든 시험 점수 미리 계산
  useEffect(() => {
    if (savedScores.length > 0 && saved.length > 0) {
      calculateAllExamScores();
    }
  }, [savedScores, saved]);

  // 모든 저장된 시험의 점수 계산
  const calculateAllExamScores = async () => {
    const token = getToken();
    if (!token || saved.length === 0) return;

    setCalculating(true);
    try {
      // 저장된 모든 시험에 대해 계산
      const allResults: CalculatedScores = {};

      for (const scoreData of savedScores) {
        const examType = scoreData.exam_type as ExamType;
        if (!EXAM_TYPES.includes(examType)) continue;
        if (allResults[examType]) continue; // 이미 계산됨

        const convertedScores = convertDbScoresToScoreForm(scoreData.scores);
        const results: { [U_ID: number]: number | null } = {};

        await Promise.all(
          saved.map(async (s) => {
            try {
              const result = await calculateScore(s.U_ID, convertedScores, activeYear, examType);
              if (result.success && result.result?.totalScore) {
                results[s.U_ID] = parseFloat(result.result.totalScore);
              } else {
                results[s.U_ID] = null;
              }
            } catch (err) {
              results[s.U_ID] = null;
            }
          })
        );

        allResults[examType] = results;
      }

      setCalculatedScores(allResults);
    } catch (err) {
      console.error("Failed to calculate all scores:", err);
    } finally {
      setCalculating(false);
    }
  };

  const loadData = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const [savedData, scoresData, year, profile] = await Promise.all([
        getSavedUniversities(token),
        getScores(token),
        getActiveYear(),
        getProfile(token),
      ]);

      const validData = savedData.filter(
        (s: SavedUniversity) => s.university !== null
      );
      setSaved(validData);
      setSavedScores(scoresData);
      setActiveYear(year);
      setUserGender(profile.gender || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 이전 시험 타입 가져오기
  const getPreviousExamType = (current: ExamType): ExamType | null => {
    const order: ExamType[] = ["3월", "6월", "9월", "수능"];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
  };

  // 시험 토글 변경 시 (점수는 이미 계산되어 있음)
  const handleExamChange = (examType: ExamType) => {
    setSelectedExam(examType);
  };

  const handleRemove = async (uId: number) => {
    if (!confirm("이 대학을 삭제하시겠습니까?\n\n⚠️ 모든 탭(3월/6월/9월/수능)에서 삭제됩니다.")) return;
    const token = getToken();
    if (!token) return;
    try {
      await toggleSaveUniversity(token, uId);
      setSaved((prev) => prev.filter((s) => s.U_ID !== uId));
    } catch (err) {
      console.error(err);
    }
  };

  // 전 시험 대비 점수 차이 계산 (수능 환산)
  const getScoreDiff = (uId: number): { diff: number; prevExam: ExamType } | null => {
    if (!selectedExam) return null;
    const prevExam = getPreviousExamType(selectedExam);
    if (!prevExam) return null;

    const currentScore = calculatedScores[selectedExam]?.[uId];
    const prevScore = calculatedScores[prevExam]?.[uId];

    if (currentScore == null || prevScore == null) return null;

    return { diff: currentScore - prevScore, prevExam };
  };

  // 전 시험 대비 실기점수 차이 계산
  const getPracticalScoreDiff = (s: SavedUniversity): { diff: number; prevExam: ExamType } | null => {
    if (!selectedExam) return null;
    const prevExam = getPreviousExamType(selectedExam);
    if (!prevExam) return null;

    const currentPractical = s.practical_by_exam?.[selectedExam]?.score;
    const prevPractical = s.practical_by_exam?.[prevExam]?.score;

    if (currentPractical == null || prevPractical == null) return null;

    return { diff: currentPractical - prevPractical, prevExam };
  };

  // 탭별 대학 필터링
  const filteredByTab = useMemo(() => {
    return saved.filter((s) => s.university.모집군 === activeTab);
  }, [saved, activeTab]);

  // 탭별 개수
  const tabCounts = useMemo(() => {
    const counts: Record<TabType, number> = { 가군: 0, 나군: 0, 다군: 0 };
    saved.forEach((s) => {
      const gun = s.university.모집군 as TabType;
      if (counts[gun] !== undefined) {
        counts[gun]++;
      }
    });
    return counts;
  }, [saved]);

  // 해당 시험 성적이 있는지 확인
  const examScoreExists = useMemo(() => {
    const result: Record<ExamType, boolean> = {
      "3월": false,
      "6월": false,
      "9월": false,
      "수능": false,
    };
    savedScores.forEach(s => {
      if (EXAM_TYPES.includes(s.exam_type as ExamType)) {
        result[s.exam_type as ExamType] = true;
      }
    });
    return result;
  }, [savedScores]);

  // 총점 계산 헬퍼 (실시간 계산 사용)
  const calcTotalScore = (s: SavedUniversity, examType?: ExamType | null) => {
    const exam = examType ?? selectedExam;
    let total = 0;

    // 실시간 계산된 수능 점수 사용
    if (exam) {
      const calcScore = calculatedScores[exam]?.[s.U_ID];
      if (calcScore !== null && calcScore !== undefined) {
        total += calcScore;
      }
    }

    if (s.naesin_score) total += Number(s.naesin_score);

    // 해당 시험의 실기점수 사용 (practical_by_exam 우선)
    const practicalScore = exam
      ? s.practical_by_exam?.[exam]?.score ?? s.practical_score
      : s.practical_score;
    if (practicalScore) total += Number(practicalScore);

    return total;
  };

  // 전 시험 대비 총점 차이 계산
  const getTotalScoreDiff = (s: SavedUniversity): { diff: number; prevExam: ExamType } | null => {
    if (!selectedExam) return null;
    const prevExam = getPreviousExamType(selectedExam);
    if (!prevExam) return null;

    // 이전 시험 성적이 있어야 비교 가능
    if (!savedScores.some(sc => sc.exam_type === prevExam)) return null;

    const currentTotal = calcTotalScore(s, selectedExam);
    const prevTotal = calcTotalScore(s, prevExam);

    if (currentTotal === 0 || prevTotal === 0) return null;

    return { diff: currentTotal - prevTotal, prevExam };
  };

  // 수능 환산점수 가져오기
  const getSunungScore = (s: SavedUniversity): number | null => {
    if (!selectedExam) return null;
    return calculatedScores[selectedExam]?.[s.U_ID] ?? null;
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Heart className="w-16 h-16 text-zinc-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
        <p className="text-zinc-500 mb-4">
          저장 대학 관리를 위해
          <br />
          로그인해 주세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">내 저장 대학</h1>
        <p className="text-sm text-zinc-500">총 {saved.length}개</p>
      </div>

      {/* 시험 토글 UI */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-3 shadow-sm">
        <p className="text-xs text-zinc-500 mb-2">성적 기준</p>
        <div className="flex gap-2">
          {EXAM_TYPES.map((exam) => (
            <button
              key={exam}
              onClick={() => handleExamChange(exam)}
              disabled={!examScoreExists[exam]}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition ${
                selectedExam === exam
                  ? "bg-blue-500 text-white"
                  : examScoreExists[exam]
                  ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                  : "bg-zinc-50 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
              }`}
            >
              {exam}
              {!examScoreExists[exam] && (
                <span className="block text-[10px] opacity-60">미입력</span>
              )}
            </button>
          ))}
        </div>

        {/* 성적 미입력 안내 */}
        {selectedExam && !selectedExamScore && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {selectedExam} 성적을 입력하세요
              </p>
              <button
                onClick={() => router.push("/mypage")}
                className="text-xs text-amber-600 dark:text-amber-500 underline mt-1"
              >
                성적 입력하러 가기
              </button>
            </div>
          </div>
        )}

        {/* 성적이 하나도 없는 경우 */}
        {!selectedExam && savedScores.length === 0 && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                저장된 성적이 없습니다
              </p>
              <button
                onClick={() => router.push("/mypage")}
                className="text-xs text-amber-600 dark:text-amber-500 underline mt-1"
              >
                성적 입력하러 가기
              </button>
            </div>
          </div>
        )}

        {/* 계산 중 표시 */}
        {calculating && (
          <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>점수 계산 중...</span>
          </div>
        )}
      </div>

      {/* 모집군 탭 */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl font-medium transition ${
              activeTab === tab
                ? "bg-blue-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {tab}
            {tabCounts[tab] > 0 && (
              <span
                className={`ml-1 text-xs ${
                  activeTab === tab ? "opacity-80" : "opacity-60"
                }`}
              >
                ({tabCounts[tab]})
              </span>
            )}
          </button>
        ))}
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">
          <Heart className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
          <p>저장된 대학이 없습니다</p>
          <p className="text-sm mt-1">대학검색에서 하트를 눌러 저장하세요</p>
        </div>
      ) : filteredByTab.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">
          <p>{activeTab}에 저장된 대학이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredByTab.map((s) => {
            const sunungScore = getSunungScore(s);
            const totalScore = calcTotalScore(s);
            const hasNaesin = s.university.내신반영비율 > 0;
            const hasScoreData = selectedExamScore !== null;
            const scoreDiff = getScoreDiff(s.U_ID);
            const practicalDiff = getPracticalScoreDiff(s);
            const totalScoreDiff = getTotalScoreDiff(s);
            // 현재 시험의 실기점수 (practical_by_exam 우선, 없으면 기존 practical_score)
            const currentPracticalScore = selectedExam
              ? s.practical_by_exam?.[selectedExam]?.score ?? s.practical_score
              : s.practical_score;

            return (
              <div
                key={s.id}
                onClick={() => setSelectedUniv(s)}
                className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(s.U_ID);
                  }}
                  className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>

                {/* 대학 정보 */}
                <div className="flex items-center gap-3 pr-10">
                  <UniversityLogo uId={s.U_ID} name={s.university.U_NM} size={32} />
                  <div>
                    <h3 className="font-bold">{s.university.U_NM}</h3>
                    <p className="text-sm text-zinc-500">{s.university.D_NM}</p>
                  </div>
                </div>

                {/* 지역 태그 + 1단계 + 배점표 버튼 */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-xs">
                    <MapPin className="w-3 h-3" /> {s.university.지역}
                  </span>
                  {s.university.단계별 && Number(s.university.단계별) > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs font-medium">
                      1단계 {s.university.단계별}배수
                    </span>
                  )}
                  {s.university.실기반영비율 > 0 && s.university.실기종목 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUnivForTable(s);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs hover:bg-purple-200 dark:hover:bg-purple-900/50 transition"
                    >
                      <TableProperties className="w-3 h-3" /> 배점표
                    </button>
                  )}
                </div>

                {/* 점수 영역 */}
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700 flex items-center gap-2">
                  {/* 수능 */}
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg py-1.5 px-2 text-center min-w-[52px]">
                    <p className="text-[9px] text-blue-500 dark:text-blue-400">{selectedExam || "수능"}</p>
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {calculating ? (
                        <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                      ) : hasScoreData && sunungScore !== null ? (
                        sunungScore.toFixed(0)
                      ) : (
                        "-"
                      )}
                    </p>
                    {scoreDiff && (
                      <p className={`text-[10px] font-medium ${
                        scoreDiff.diff > 0 ? "text-red-500" : scoreDiff.diff < 0 ? "text-blue-500" : "text-zinc-400"
                      }`}>
                        {scoreDiff.diff > 0 ? "↑" : scoreDiff.diff < 0 ? "↓" : "−"}{Math.abs(scoreDiff.diff).toFixed(1)}
                      </p>
                    )}
                  </div>

                  {/* 내신 */}
                  {hasNaesin && (
                    <div className="bg-green-50 dark:bg-green-900/30 rounded-lg py-1.5 px-2 text-center min-w-[52px]">
                      <p className="text-[9px] text-green-500 dark:text-green-400">내신</p>
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                        {s.naesin_score ? Number(s.naesin_score).toFixed(0) : "-"}
                      </p>
                    </div>
                  )}

                  {/* 실기 */}
                  <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg py-1.5 px-2 text-center min-w-[52px]">
                    <p className="text-[9px] text-purple-500 dark:text-purple-400">실기</p>
                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                      {currentPracticalScore ? Number(currentPracticalScore).toFixed(0) : "-"}
                    </p>
                    {practicalDiff && (
                      <p className={`text-[10px] font-medium ${
                        practicalDiff.diff > 0 ? "text-red-500" : practicalDiff.diff < 0 ? "text-blue-500" : "text-zinc-400"
                      }`}>
                        {practicalDiff.diff > 0 ? "↑" : practicalDiff.diff < 0 ? "↓" : "−"}{Math.abs(practicalDiff.diff).toFixed(0)}
                      </p>
                    )}
                  </div>

                  {/* 총점 */}
                  <div className="flex-1 text-right">
                    <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                      {calculating ? (
                        <Loader2 className="w-5 h-5 animate-spin inline" />
                      ) : hasScoreData && totalScore > 0 ? (
                        <>
                          {totalScore.toFixed(1)}
                          <span className="text-xs font-normal text-zinc-400 ml-0.5">점</span>
                        </>
                      ) : (
                        "-"
                      )}
                    </p>
                    {totalScoreDiff && (
                      <p className={`text-xs font-medium ${
                        totalScoreDiff.diff > 0 ? "text-red-500" : totalScoreDiff.diff < 0 ? "text-blue-500" : "text-zinc-400"
                      }`}>
                        {totalScoreDiff.diff > 0 ? "↑" : totalScoreDiff.diff < 0 ? "↓" : "−"}{Math.abs(totalScoreDiff.diff).toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>

                {/* 합격컷 정보 */}
                {s.university.cutoff && (
                  <CutoffDisplay
                    cutoff={s.university.cutoff}
                    sunungScore={sunungScore}
                    isRelativeEval={s.university.is_relative_eval || false}
                    stepType={Number(s.university.단계별) || 0}
                    practicalMode={s.university.practical_mode || 'basic'}
                    practicalTotal={s.university.practical_total || 0}
                    tableMaxSum={s.university.table_max_sum || 0}
                    deductionUnit={s.university.deduction_unit || 0}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedUniv && (
        <UniversityModal
          saved={selectedUniv}
          userGender={userGender}
          selectedExam={selectedExam}
          selectedExamScore={selectedExamScore}
          calculatedScore={selectedExam ? (calculatedScores[selectedExam]?.[selectedUniv.U_ID] ?? null) : null}
          activeYear={activeYear}
          onClose={() => setSelectedUniv(null)}
          onUpdate={loadData}
        />
      )}

      {selectedUnivForTable && (
        <ScoreTableModal
          U_ID={selectedUnivForTable.U_ID}
          universityName={selectedUnivForTable.university.U_NM}
          departmentName={selectedUnivForTable.university.D_NM}
          gender={userGender}
          onClose={() => setSelectedUnivForTable(null)}
        />
      )}
    </div>
  );
}

function UniversityModal({
  saved,
  userGender,
  selectedExam,
  selectedExamScore,
  calculatedScore,
  activeYear,
  onClose,
  onUpdate,
}: {
  saved: SavedUniversity;
  userGender: string;
  selectedExam: ExamType | null;
  selectedExamScore: ScoreForm | null;
  calculatedScore: number | null;
  activeYear: number;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const router = useRouter();
  const [naesinScore, setNaesinScore] = useState(
    saved.naesin_score?.toString() || ""
  );
  const [memo, setMemo] = useState(saved.memo || "");
  const [saving, setSaving] = useState(false);

  // 실기 관련 상태
  const [practicalData, setPracticalData] =
    useState<PracticalScoreData | null>(null);
  const [practicalLoading, setPracticalLoading] = useState(false);
  const [practicalRecords, setPracticalRecords] = useState<
    Record<string, string>
  >({});
  const [practicalResult, setPracticalResult] = useState<{
    totalScore: number;
    events: EventRecord[];
    totalDeduction: number;
  } | null>(null);

  const univ = saved.university;
  const sunungScore = calculatedScore ?? 0;
  const hasPractical =
    univ.실기반영비율 > 0 && univ.실기종목 && univ.실기종목.length > 0;

  // 카카오 SDK 초기화
  useEffect(() => {
    initKakao();
  }, []);

  // 배점표 로드
  useEffect(() => {
    const loadData = async () => {
      const token = getToken();
      if (!token) return;

      setPracticalLoading(true);
      try {
        const data = await getPracticalScoreTable(
          token,
          saved.U_ID,
          activeYear,
          userGender
        );
        setPracticalData(data);
      } catch (err) {
        console.error("Failed to load practical data:", err);
      } finally {
        setPracticalLoading(false);
      }
    };

    if (hasPractical) {
      loadData();
    }
  }, [saved.U_ID, hasPractical, userGender, activeYear]);

  // 저장된 실기 기록 복원 (시험별)
  useEffect(() => {
    // 시험별 데이터가 있으면 우선 사용
    const examType = selectedExam || "수능";
    const examData = saved.practical_by_exam?.[examType];

    if (examData?.events) {
      const records: Record<string, string> = {};
      for (const rec of examData.events) {
        records[rec.event] = rec.record || "";
      }
      setPracticalRecords(records);
    } else if (saved.practical_records && Array.isArray(saved.practical_records)) {
      // 기존 데이터 (하위 호환 - 배열 형태만)
      const records: Record<string, string> = {};
      for (const rec of saved.practical_records) {
        records[rec.event] = rec.record || "";
      }
      setPracticalRecords(records);
    } else {
      // 데이터 없으면 초기화
      setPracticalRecords({});
    }
  }, [saved.practical_by_exam, saved.practical_records, selectedExam]);

  // 실기 점수 계산
  const calculatePractical = useCallback(() => {
    if (!practicalData || !practicalData.events.length) return null;

    const config: PracticalConfig = {
      practicalMode: practicalData.practicalMode,
      practicalTotal: practicalData.practicalTotal,
      baseScore: practicalData.baseScore,
      failHandling: practicalData.failHandling,
      U_ID: saved.U_ID,
    };

    const studentRecords = practicalData.events.map((event) => ({
      event,
      record: practicalRecords[event] || "",
    }));

    return calculatePracticalScore(
      config,
      practicalData.scoreTable,
      studentRecords,
      userGender
    );
  }, [practicalData, practicalRecords, userGender, saved.U_ID]);

  // 기록 변경 시 자동 계산
  useEffect(() => {
    if (practicalData) {
      const result = calculatePractical();
      setPracticalResult(result);
    }
  }, [practicalRecords, practicalData, calculatePractical]);

  // 총점 계산
  const totalScore = useMemo(() => {
    let total = sunungScore;
    if (naesinScore) total += parseFloat(naesinScore);
    if (practicalResult) total += practicalResult.totalScore;
    return total;
  }, [sunungScore, naesinScore, practicalResult]);

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const practicalRecordsList: EventRecord[] =
        practicalResult?.events || [];

      await updateSavedUniversity(token, saved.U_ID, {
        naesin_score: naesinScore ? parseFloat(naesinScore) : undefined,
        memo: memo || undefined,
        practical_score: practicalResult?.totalScore,
        practical_records: practicalRecordsList.map((ev) => ({
          event: ev.event,
          record: ev.record,
          score: ev.score,
          deduction: ev.deduction,
        })),
        exam_type: selectedExam || "수능", // 시험별 저장
      });
      onUpdate();
      onClose();
    } catch (err) {
      alert("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleRecordChange = (event: string, value: string) => {
    setPracticalRecords((prev) => ({
      ...prev,
      [event]: value,
    }));
  };

  // 카카오 공유
  const handleShare = () => {
    // U_ID에서 로고용 기본 ID 추출 (2026: 1-200, 2027: 1001-1200, 2028: 2001-2200)
    let baseUId = saved.U_ID;
    if (baseUId >= 2000) baseUId -= 2000;
    else if (baseUId >= 1000) baseUId -= 1000;

    shareScore({
      universityName: univ.U_NM,
      departmentName: univ.D_NM,
      region: univ.지역,
      totalScore,
      sunungScore,
      naesinScore: naesinScore ? parseFloat(naesinScore) : undefined,
      practicalScore: practicalResult?.totalScore,
      practicalRecords: practicalResult?.events.map((e) => ({
        event: e.event,
        record: e.record,
        score: e.score,
        deduction: e.deduction,
        unit: practicalData?.units?.[e.event]?.unit || '',
      })),
      totalDeduction: practicalResult?.totalDeduction,
      ratios: {
        sunung: univ.수능반영비율,
        naesin: univ.내신반영비율,
        practical: univ.실기반영비율,
      },
      logoUrl: `/univlogos/${baseUId}.png`,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-800 p-4 border-b dark:border-zinc-700 flex items-center justify-between z-10">
          <h2 className="font-bold text-lg">상세 정보</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* University Info */}
          <div>
            <h3 className="font-bold text-lg">{univ.U_NM}</h3>
            <p className="text-zinc-500">{univ.D_NM}</p>
          </div>

          {/* 성적 기준 표시 */}
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-medium">
              {selectedExam || "수능"} 기준
            </span>
            {!selectedExamScore && (
              <span className="text-amber-600 dark:text-amber-400 text-xs">
                성적 미입력
              </span>
            )}
          </div>

          {/* Total Score */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white text-center">
            <p className="text-sm opacity-80">예상 총점</p>
            {selectedExamScore ? (
              <p className="text-3xl font-bold">{totalScore.toFixed(2)}점</p>
            ) : (
              <p className="text-xl font-medium opacity-80">성적을 입력하세요</p>
            )}
          </div>

          {/* Score Breakdown */}
          <div
            className={`grid gap-3 ${
              univ.내신반영비율 > 0 ? "grid-cols-3" : "grid-cols-2"
            }`}
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {selectedExam || "수능"} 환산
              </p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {selectedExamScore && sunungScore ? sunungScore.toFixed(1) : "-"}
              </p>
            </div>
            {univ.내신반영비율 > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">내신</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {naesinScore || "-"}
                </p>
              </div>
            )}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">실기</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {practicalResult ? practicalResult.totalScore.toFixed(1) : "-"}
              </p>
              {practicalResult && practicalResult.totalDeduction > 0 && (
                <p className="text-xs text-orange-500">
                  (총 {practicalResult.totalDeduction}감)
                </p>
              )}
            </div>
          </div>

          {/* 성적 미입력 안내 */}
          {!selectedExamScore && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                    {selectedExam || "수능"} 성적이 입력되지 않았습니다
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                    마이페이지에서 성적을 입력하면 정확한 환산점수를 확인할 수 있습니다.
                  </p>
                  <button
                    onClick={() => router.push("/mypage")}
                    className="mt-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg transition"
                  >
                    성적 입력하러 가기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ratio Info Cards */}
          <div className="grid grid-cols-3 gap-2">
            {univ.수능반영비율 > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">수능</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{univ.수능반영비율}%</p>
              </div>
            )}
            {univ.내신반영비율 > 0 && (
              <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-3 text-center">
                <p className="text-xs text-green-600 dark:text-green-400 mb-1">내신</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">{univ.내신반영비율}%</p>
              </div>
            )}
            {univ.실기반영비율 > 0 && (
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-3 text-center">
                <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">실기</p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{univ.실기반영비율}%</p>
              </div>
            )}
          </div>

          {/* Practical Events Input */}
          {hasPractical && (
            <div className="space-y-3">
              <h4 className="font-medium">실기 기록 입력</h4>

              {practicalLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                </div>
              ) : practicalData && practicalData.events.length > 0 ? (
                <div className="space-y-2">
                  {practicalData.events.map((event) => {
                    const eventResult = practicalResult?.events.find(
                      (e) => e.event === event
                    );
                    return (
                      <div
                        key={event}
                        className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-xl p-3"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event}</p>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={practicalRecords[event] || ""}
                            onChange={(e) =>
                              handleRecordChange(event, e.target.value)
                            }
                            placeholder="기록 입력"
                            className="mt-1 w-full px-3 py-2 text-sm border rounded-lg dark:bg-zinc-600 dark:border-zinc-500"
                          />
                        </div>
                        <div className="text-right min-w-[60px]">
                          {eventResult?.score !== undefined ? (
                            eventResult.deduction !== undefined &&
                            eventResult.deduction > 0 ? (
                              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded text-sm font-medium">
                                {eventResult.deduction}감
                              </span>
                            ) : (
                              <span className="text-green-500 text-sm">
                                만점
                              </span>
                            )
                          ) : (
                            <span className="text-zinc-400 text-sm">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-xl p-4">
                  <p className="text-sm text-zinc-500">{univ.실기종목}</p>
                  <p className="text-xs text-zinc-400 mt-2">
                    * 배점표가 없습니다
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Naesin Input */}
          {univ.내신반영비율 > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                내신 점수 입력
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={naesinScore}
                onChange={(e) => setNaesinScore(e.target.value)}
                placeholder="내신 점수를 입력하세요"
                className="w-full px-4 py-3 border rounded-xl dark:bg-zinc-700 dark:border-zinc-600"
              />
            </div>
          )}

          {/* Memo */}
          <div>
            <label className="block text-sm font-medium mb-2">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 입력하세요"
              rows={3}
              className="w-full px-4 py-3 border rounded-xl dark:bg-zinc-700 dark:border-zinc-600 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 py-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            >
              <Share2 className="w-5 h-5" />
              카카오 공유
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
