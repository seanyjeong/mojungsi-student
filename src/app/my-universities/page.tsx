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
} from "@/lib/api";
import {
  calculatePracticalScore,
  PracticalConfig,
  ScoreRow,
  EventRecord,
} from "@/lib/practical-calc";
import { Heart, MapPin, X, Save, Loader2, Share2 } from "lucide-react";
import { shareScore, initKakao } from "@/lib/kakao-share";

interface SavedUniversity {
  id: number;
  U_ID: number;
  sunung_score: number | null;
  naesin_score: number | null;
  practical_score: number | null;
  practical_records: EventRecord[] | null;
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

const TABS = ["가군", "나군", "다군"] as const;
type TabType = (typeof TABS)[number];

export default function MyUniversitiesPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  useRequireProfile();
  const [saved, setSaved] = useState<SavedUniversity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUniv, setSelectedUniv] = useState<SavedUniversity | null>(
    null
  );
  const [userGender, setUserGender] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("가군");

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) {
      loadSaved();
      loadUserProfile();
    }
  }, [isLoggedIn]);

  const loadUserProfile = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const profile = await getProfile(token);
      setUserGender(profile.gender || "");
    } catch (err) {
      console.error(err);
    }
  };

  const loadSaved = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await getSavedUniversities(token);
      const validData = data.filter(
        (s: SavedUniversity) => s.university !== null
      );
      setSaved(validData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (uId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const token = getToken();
    if (!token) return;
    try {
      await toggleSaveUniversity(token, uId);
      setSaved((prev) => prev.filter((s) => s.U_ID !== uId));
    } catch (err) {
      console.error(err);
    }
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

  // 총점 계산 헬퍼
  const calcTotalScore = (s: SavedUniversity) => {
    let total = 0;
    if (s.sunung_score) total += Number(s.sunung_score);
    if (s.naesin_score) total += Number(s.naesin_score);
    if (s.practical_score) total += Number(s.practical_score);
    return total;
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
            const totalScore = calcTotalScore(s);
            const hasNaesin = s.university.내신반영비율 > 0;

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
                <div className="pr-10">
                  <h3 className="font-bold">{s.university.U_NM}</h3>
                  <p className="text-sm text-zinc-500">{s.university.D_NM}</p>
                </div>

                {/* 지역 태그 */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-xs">
                    <MapPin className="w-3 h-3" /> {s.university.지역}
                  </span>
                </div>

                {/* 점수 영역 - 한 줄 */}
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700 flex items-center gap-3">
                  {/* 세부 점수 카드 */}
                  <div className="flex gap-1.5">
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg py-1 px-2 text-center min-w-[50px]">
                      <p className="text-[9px] text-blue-500 dark:text-blue-400">수능</p>
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        {s.sunung_score ? Number(s.sunung_score).toFixed(0) : "-"}
                      </p>
                    </div>
                    {hasNaesin && (
                      <div className="bg-green-50 dark:bg-green-900/30 rounded-lg py-1 px-2 text-center min-w-[50px]">
                        <p className="text-[9px] text-green-500 dark:text-green-400">내신</p>
                        <p className="text-xs font-semibold text-green-700 dark:text-green-300">
                          {s.naesin_score ? Number(s.naesin_score).toFixed(0) : "-"}
                        </p>
                      </div>
                    )}
                    <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg py-1 px-2 text-center min-w-[50px]">
                      <p className="text-[9px] text-purple-500 dark:text-purple-400">실기</p>
                      <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                        {s.practical_score ? Number(s.practical_score).toFixed(0) : "-"}
                      </p>
                    </div>
                  </div>

                  {/* 총점 - 오른쪽 끝 */}
                  <div className="flex-1 text-right">
                    <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                      {totalScore > 0 ? totalScore.toFixed(1) : "-"}
                      <span className="text-xs font-normal text-zinc-400 ml-0.5">점</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedUniv && (
        <UniversityModal
          saved={selectedUniv}
          userGender={userGender}
          onClose={() => setSelectedUniv(null)}
          onUpdate={loadSaved}
        />
      )}
    </div>
  );
}

function UniversityModal({
  saved,
  userGender,
  onClose,
  onUpdate,
}: {
  saved: SavedUniversity;
  userGender: string;
  onClose: () => void;
  onUpdate: () => void;
}) {
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
  const sunungScore = saved.sunung_score ? Number(saved.sunung_score) : 0;
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
        const activeYear = await getActiveYear();
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
  }, [saved.U_ID, hasPractical, userGender]);

  // 저장된 실기 기록 복원
  useEffect(() => {
    if (saved.practical_records) {
      const records: Record<string, string> = {};
      for (const rec of saved.practical_records) {
        records[rec.event] = rec.record || "";
      }
      setPracticalRecords(records);
    }
  }, [saved.practical_records]);

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

          {/* Total Score */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white text-center">
            <p className="text-sm opacity-80">예상 총점</p>
            <p className="text-3xl font-bold">{totalScore.toFixed(2)}점</p>
          </div>

          {/* Score Breakdown */}
          <div
            className={`grid gap-3 ${
              univ.내신반영비율 > 0 ? "grid-cols-3" : "grid-cols-2"
            }`}
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                수능환산
              </p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {sunungScore ? sunungScore.toFixed(1) : "-"}
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
