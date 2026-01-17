"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth, getToken } from "@/lib/auth";
import { getUniversities, calculateAll, toggleSaveUniversity, checkIsSaved, getProfile } from "@/lib/api";
import { loadScores } from "@/lib/storage";
import { Heart, Filter, MapPin, Users, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

interface SubjectDisplay {
  korean?: string;
  math?: string;
  english?: string;
  inquiry?: string;
  history?: string;
  inquiry_count?: string;
}

interface University {
  U_ID: number;
  U_NM: string;
  D_NM: string;
  지역: string;
  모집인원: number;
  모집군: string;
  실기종목: string;
  수능반영비율: number;
  내신반영비율: number;
  실기반영비율: number;
  subjectDisplay?: SubjectDisplay;
  isWomensUniv?: boolean;
}

// API 응답을 플랫 구조로 변환
function transformApiResponse(apiData: any[]): University[] {
  const result: University[] = [];

  for (const univ of apiData) {
    if (!univ.departments) continue;

    for (const dept of univ.departments) {
      const fc = dept.formula_configs;
      const config = fc?.display_config || {};
      const ratios = config.비율 || {};

      // display_config가 있으면 그걸 사용, 없으면 formula_configs 필드에서 직접 추출
      const suneungRatio = ratios.수능
        ? parseInt(ratios.수능)
        : fc?.suneung_ratio
        ? parseFloat(fc.suneung_ratio)
        : 100;
      const naesinRatio = ratios.내신 ? parseInt(ratios.내신) : 0;
      const silgiRatio = ratios.실기
        ? parseInt(ratios.실기)
        : fc?.practical_total > 0
        ? 100 - suneungRatio
        : 0;

      // 실기종목 가져오기 (practical_events 배열 또는 display_config)
      const practicalEvents = dept.practical_events?.join(', ') || config.실기종목 || "";

      result.push({
        U_ID: dept.dept_id,
        U_NM: univ.univ_name,
        D_NM: dept.dept_name,
        지역: univ.region || "미정",
        모집인원: dept.recruit_count || 0,
        모집군: dept.recruit_group ? `${dept.recruit_group}군` : "",
        실기종목: practicalEvents,
        수능반영비율: suneungRatio || 0,
        내신반영비율: naesinRatio || 0,
        실기반영비율: silgiRatio || 0,
        subjectDisplay: dept.subject_display || undefined,
        isWomensUniv: univ.isWomensUniv || false,
      });
    }
  }

  return result;
}

interface CalculatedUniv extends University {
  calculatedScore?: number;
  isSaved?: boolean;
}

const 군목록 = ["전체", "가군", "나군", "다군"];
const 지역목록 = ["전체", "서울", "경기", "인천", "강원", "충북", "충남", "대전", "세종", "전북", "전남", "광주", "경북", "경남", "대구", "울산", "부산", "제주"];

export default function SearchPage() {
  const { isLoggedIn } = useAuth();
  const [universities, setUniversities] = useState<CalculatedUniv[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGun, setSelectedGun] = useState("전체");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [showFilter, setShowFilter] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [userGender, setUserGender] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const rawData = await getUniversities(2026);
      const data = transformApiResponse(rawData);
      const scores = loadScores();

      let calculated: CalculatedUniv[] = data;

      // Calculate scores if user has entered scores
      if (scores && Object.keys(scores).length > 0) {
        try {
          const response = await calculateAll(scores, 2026);
          // 대학명+학과명으로 매칭 (U_ID가 다른 테이블이라 불일치)
          const scoreMap = new Map(
            response.results.map((r: any) => [
              `${r.university?.univName}_${r.university?.deptName}`,
              r.finalScore,
            ])
          );
          calculated = data.map((u: University) => ({
            ...u,
            calculatedScore: scoreMap.get(`${u.U_NM}_${u.D_NM}`),
          }));
        } catch (err) {
          console.error("Calculation error:", err);
        }
      }

      // Check saved status and get user profile for logged-in users
      if (isLoggedIn) {
        const token = getToken();
        if (token) {
          // Get user profile (including gender)
          try {
            const profile = await getProfile(token);
            setUserGender(profile.gender || null);
          } catch {
            // ignore profile fetch error
          }

          const withSaved = await Promise.all(
            calculated.map(async (u) => {
              try {
                const { saved } = await checkIsSaved(token, u.U_ID);
                return { ...u, isSaved: saved };
              } catch {
                return u;
              }
            })
          );
          calculated = withSaved;
        }
      }

      setUniversities(calculated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleSave = async (uId: number) => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다");
      return;
    }
    const token = getToken();
    if (!token) return;

    setSavingId(uId);
    try {
      const { saved } = await toggleSaveUniversity(token, uId);
      setUniversities((prev) =>
        prev.map((u) => (u.U_ID === uId ? { ...u, isSaved: saved } : u))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const filteredUniversities = useMemo(() => {
    return universities.filter((u) => {
      if (selectedGun !== "전체" && u.모집군 !== selectedGun) return false;
      if (selectedRegion !== "전체" && u.지역 !== selectedRegion) return false;
      if (searchText) {
        const search = searchText.toLowerCase();
        if (
          !u.U_NM.toLowerCase().includes(search) &&
          !u.D_NM.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [universities, selectedGun, selectedRegion, searchText]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="대학/학과 검색..."
          className="flex-1 px-4 py-3 border rounded-xl bg-white dark:bg-zinc-800 dark:border-zinc-700"
        />
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`px-4 py-3 rounded-xl border transition ${
            showFilter ? "bg-blue-500 text-white border-blue-500" : "bg-white dark:bg-zinc-800 dark:border-zinc-700"
          }`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">모집군</label>
            <div className="flex flex-wrap gap-2">
              {군목록.map((gun) => (
                <button
                  key={gun}
                  onClick={() => setSelectedGun(gun)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    selectedGun === gun
                      ? "bg-blue-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {gun}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">지역</label>
            <div className="flex flex-wrap gap-2">
              {지역목록.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    selectedRegion === region
                      ? "bg-blue-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedGun("전체");
              setSelectedRegion("전체");
              setSearchText("");
            }}
            className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-700"
          >
            필터 초기화
          </button>
        </div>
      )}

      {/* Gun Quick Filter */}
      <div className="flex justify-center gap-2">
        {군목록.map((gun) => (
          <button
            key={gun}
            onClick={() => setSelectedGun(gun)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedGun === gun
                ? "bg-blue-500 text-white"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border dark:border-zinc-700"
            }`}
          >
            {gun}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-sm text-zinc-500 text-center">
        총 {filteredUniversities.length}개 대학
      </p>

      {/* University Cards */}
      <div className="space-y-3">
        {filteredUniversities.map((univ) => (
          <UniversityCard
            key={univ.U_ID}
            univ={univ}
            onToggleSave={() => handleToggleSave(univ.U_ID)}
            saving={savingId === univ.U_ID}
            userGender={userGender}
          />
        ))}
      </div>

      {filteredUniversities.length === 0 && (
        <div className="text-center py-10 text-zinc-500">
          검색 결과가 없습니다
        </div>
      )}
    </div>
  );
}

function UniversityCard({
  univ,
  onToggleSave,
  saving,
  userGender,
}: {
  univ: CalculatedUniv;
  onToggleSave: () => void;
  saving: boolean;
  userGender: string | null;
}) {
  const [expanded, setExpanded] = useState(false);

  // 남자 사용자가 여대를 볼 때 저장 불가
  const isRestricted = univ.isWomensUniv && userGender === "남";

  return (
    <div className={`rounded-xl p-4 shadow-sm relative ${
      isRestricted
        ? "bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800"
        : "bg-white dark:bg-zinc-800"
    }`}>
      {/* Women's University Warning */}
      {isRestricted && (
        <div className="mb-3 px-3 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 text-xs font-medium">
          여자대학교 - 남성은 지원할 수 없습니다
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={onToggleSave}
        disabled={saving || isRestricted}
        title={isRestricted ? "여대는 저장할 수 없습니다" : undefined}
        className={`absolute top-4 right-4 p-2 rounded-full transition ${
          isRestricted
            ? "text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
            : univ.isSaved
              ? "text-red-500"
              : "text-zinc-400 hover:text-red-400"
        }`}
      >
        <Heart className={`w-5 h-5 ${univ.isSaved && !isRestricted ? "fill-current" : ""}`} />
      </button>

      {/* Header */}
      <div className="pr-10">
        <h3 className="font-bold text-lg">{univ.U_NM}</h3>
        <p className="text-zinc-500 text-sm">{univ.D_NM}</p>
      </div>

      {/* Info Tags */}
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-xs">
          <MapPin className="w-3 h-3" /> {univ.지역}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-xs">
          <Users className="w-3 h-3" /> {univ.모집인원}명
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium">
          {univ.모집군}
        </span>
      </div>

      {/* Ratio Tags */}
      <div className="flex flex-wrap gap-2 mt-2">
        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded text-xs font-medium">
          수능 {univ.수능반영비율}%
        </span>
        {univ.내신반영비율 > 0 && (
          <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded text-xs font-medium">
            내신 {univ.내신반영비율}%
          </span>
        )}
        <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded text-xs font-medium">
          실기 {univ.실기반영비율}%
        </span>
      </div>

      {/* Practical Events */}
      {univ.실기종목 && (
        <p className="text-xs text-zinc-500 mt-2">
          실기종목: {univ.실기종목}
        </p>
      )}

      {/* Expand Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-center w-full mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700 text-sm text-zinc-500"
      >
        {expanded ? (
          <>
            접기 <ChevronUp className="w-4 h-4 ml-1" />
          </>
        ) : (
          <>
            상세보기 <ChevronDown className="w-4 h-4 ml-1" />
          </>
        )}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-700">
          {/* 과목별 반영비율 (CSV 데이터) */}
          {univ.subjectDisplay && (
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-2">과목별 반영비율</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded px-2 py-1.5">
                  <span className="text-zinc-500">국어</span>
                  <p className="font-medium">{univ.subjectDisplay.korean || "-"}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded px-2 py-1.5">
                  <span className="text-zinc-500">수학</span>
                  <p className="font-medium">{univ.subjectDisplay.math || "-"}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded px-2 py-1.5">
                  <span className="text-zinc-500">영어</span>
                  <p className="font-medium">{univ.subjectDisplay.english || "-"}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded px-2 py-1.5">
                  <span className="text-zinc-500">탐구</span>
                  <p className="font-medium">
                    {univ.subjectDisplay.inquiry || "-"}
                    {univ.subjectDisplay.inquiry_count && (
                      <span className="text-zinc-400 ml-1">({univ.subjectDisplay.inquiry_count}과목)</span>
                    )}
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded px-2 py-1.5">
                  <span className="text-zinc-500">한국사</span>
                  <p className="font-medium">{univ.subjectDisplay.history || "-"}</p>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 mt-2">
                * 괄호 안 숫자 = 택1 비율 (예: 국/수/영 중 1과목 선택)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Calculated Score */}
      {univ.calculatedScore !== undefined && (
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700 flex justify-between items-center">
          <span className="text-sm text-zinc-500">내 수능환산</span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {univ.calculatedScore.toFixed(2)}점
          </span>
        </div>
      )}
    </div>
  );
}
