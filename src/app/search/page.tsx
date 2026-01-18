"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAuth, getToken, useRequireProfile } from "@/lib/auth";
import { getUniversities, calculateAll, toggleSaveUniversity, checkIsSaved, getProfile, getScores, getActiveYear } from "@/lib/api";
import { ScoreForm } from "@/types";
import { Heart, Filter, MapPin, Users, TrendingUp, ChevronDown, ChevronUp, Info, AlertCircle } from "lucide-react";

// 초성 추출 함수
function getChosung(str: string): string {
  const cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  const code = str.charCodeAt(0) - 44032;
  if (code < 0 || code > 11171) return "";
  return cho[Math.floor(code / 588)];
}

const 초성목록 = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

// DB 형식(한글)을 API 형식(ScoreForm)으로 변환
function convertDbScoresToScoreForm(data: any): ScoreForm {
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
  모집인원: string;
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

      // jungsi_ratio 데이터 우선 사용, 없으면 display_config에서 추출
      const jungsiRatio = dept.jungsi_ratio;
      const suneungRatio = jungsiRatio?.suneung != null
        ? Number(jungsiRatio.suneung)
        : ratios.수능
        ? parseInt(ratios.수능)
        : fc?.suneung_ratio
        ? parseFloat(fc.suneung_ratio)
        : 100;
      const naesinRatio = jungsiRatio?.naesin != null
        ? Number(jungsiRatio.naesin)
        : ratios.내신 ? parseInt(ratios.내신) : 0;
      const silgiRatio = jungsiRatio?.silgi != null
        ? Number(jungsiRatio.silgi)
        : ratios.실기 && ratios.실기 !== ""
        ? parseInt(ratios.실기)
        : fc?.practical_total > 0
        ? 100 - suneungRatio
        : 0;

      // 실기종목 가져오기 (practical_events 배열 또는 display_config)
      const practicalEvents = dept.practical_events?.join(', ') || config.실기종목 || "";

      // legacy_uid가 jungsi_basic의 U_ID와 매칭됨
      const legacyUid = fc?.legacy_uid || dept.dept_id;

      result.push({
        U_ID: legacyUid,
        U_NM: univ.univ_name,
        D_NM: dept.dept_name,
        지역: dept.region || univ.region || "미정",
        모집인원: dept.quota || (dept.recruit_count ? String(dept.recruit_count) : "0"),
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
const 지역목록 = ["서울", "경기", "인천", "강원", "충북", "충남", "대전", "세종", "전북", "전남", "광주", "경북", "경남", "대구", "울산", "부산", "제주"];

export default function SearchPage() {
  const { isLoggedIn } = useAuth();
  const { isProfileComplete } = useRequireProfile();
  const [universities, setUniversities] = useState<CalculatedUniv[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGun, setSelectedGun] = useState("전체");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [userGender, setUserGender] = useState<string | null>(null);
  const [showChosungBar, setShowChosungBar] = useState(false);
  const [usedExamType, setUsedExamType] = useState<string | null>(null);
  const [noScoreWarning, setNoScoreWarning] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const chosungRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 스크롤 감지해서 초성바 표시 (2초 후 자동 숨김)
  useEffect(() => {
    let hideTimer: NodeJS.Timeout;

    const handleScroll = () => {
      // 스크롤 위치가 200px 이상일 때만 표시
      if (window.scrollY > 200) {
        setShowChosungBar(true);

        // 기존 타이머 취소하고 새로 설정
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          setShowChosungBar(false);
        }, 2000);
      } else {
        setShowChosungBar(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(hideTimer);
    };
  }, []);

  // 지역 토글 함수
  const toggleRegion = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  // 초성으로 스크롤
  const scrollToChosung = (chosung: string) => {
    const ref = chosungRefs.current[chosung];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 활성 연도 조회
      const activeYear = await getActiveYear();
      const rawData = await getUniversities(activeYear);
      const data = transformApiResponse(rawData);

      // 로그인 시에만 DB에서 성적 가져와서 계산 (비로그인은 계산 안 함)
      let scores: ScoreForm | null = null;
      const token = getToken();
      if (token) {
        try {
          // 프로필에서 계산용 시험 타입 조회
          const profile = await getProfile(token);
          const selectedExamType = profile.calc_exam_type || "수능";

          const dbScores = await getScores(token, activeYear);

          if (dbScores && dbScores.length > 0) {
            // 선택된 시험 타입의 성적 찾기
            const selectedScore = dbScores.find((s: any) => s.exam_type === selectedExamType);

            if (selectedScore?.scores) {
              // 선택된 시험의 성적 사용
              scores = convertDbScoresToScoreForm(selectedScore.scores);
              setUsedExamType(selectedExamType);
              setNoScoreWarning(false);
            } else if (dbScores[0].scores) {
              // 선택된 시험에 성적이 없으면 첫 번째 성적 사용 (fallback)
              scores = convertDbScoresToScoreForm(dbScores[0].scores);
              setUsedExamType(dbScores[0].exam_type);
              setNoScoreWarning(true); // 경고 표시
            }
          } else {
            setUsedExamType(null);
            setNoScoreWarning(false);
          }
        } catch {
          // DB 실패 시 계산 없이 진행
          setUsedExamType(null);
        }
      }
      // 로그인 안 되어 있으면 scores는 null이므로 계산 안 됨

      let calculated: CalculatedUniv[] = data;

      // Calculate scores if user has entered scores
      if (scores && Object.keys(scores).length > 0) {
        try {
          const response = await calculateAll(scores, activeYear);
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

    // 저장 시 환산점수도 함께 전달
    const univ = universities.find((u) => u.U_ID === uId);
    const score = univ?.calculatedScore;

    setSavingId(uId);
    try {
      const { saved } = await toggleSaveUniversity(token, uId, score);
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
      if (selectedRegions.length > 0 && !selectedRegions.includes(u.지역)) return false;
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
  }, [universities, selectedGun, selectedRegions, searchText]);

  // 초성별 그룹핑
  const groupedByChosung = useMemo(() => {
    const groups: { [key: string]: CalculatedUniv[] } = {};
    filteredUniversities.forEach(u => {
      const cho = getChosung(u.U_NM);
      // ㄲ→ㄱ, ㄸ→ㄷ 등 쌍자음 병합
      const normalizedCho = cho === "ㄲ" ? "ㄱ" : cho === "ㄸ" ? "ㄷ" : cho === "ㅃ" ? "ㅂ" : cho === "ㅆ" ? "ㅅ" : cho === "ㅉ" ? "ㅈ" : cho;
      if (normalizedCho && 초성목록.includes(normalizedCho)) {
        if (!groups[normalizedCho]) groups[normalizedCho] = [];
        groups[normalizedCho].push(u);
      }
    });
    return groups;
  }, [filteredUniversities]);

  if (loading) {
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
        <p className="text-zinc-500 mb-4">대학 검색 및 환산점수 확인을 위해<br />로그인해 주세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* 사용 중인 성적 안내 배너 */}
      {usedExamType && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
          noScoreWarning
            ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
            : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
        }`}>
          {noScoreWarning ? (
            <>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                선택한 시험 성적이 없어 <strong>{usedExamType}</strong> 성적으로 계산합니다
              </span>
            </>
          ) : (
            <>
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>{usedExamType}</strong> 성적으로 환산점수를 계산합니다
              </span>
            </>
          )}
        </div>
      )}

      {/* 성적 미입력 안내 */}
      {!usedExamType && isLoggedIn && !loading && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>
            내정보에서 성적을 입력하면 환산점수를 확인할 수 있습니다
          </span>
        </div>
      )}

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
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">
              지역 {selectedRegions.length > 0 && <span className="text-blue-500">({selectedRegions.length}개 선택)</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {지역목록.map((region) => (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={`px-3 py-1.5 rounded-full text-sm transition ${
                    selectedRegions.includes(region)
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
              setSelectedRegions([]);
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
        {selectedRegions.length > 0 && ` (${selectedRegions.join(", ")})`}
      </p>

      {/* University Cards - 초성별 그룹 */}
      <div className="space-y-3 relative" ref={listRef}>
        {초성목록.map((chosung) => {
          const univs = groupedByChosung[chosung];
          if (!univs || univs.length === 0) return null;
          return (
            <div key={chosung} ref={(el) => { chosungRefs.current[chosung] = el; }}>
              <div className="sticky top-0 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-sm font-bold text-zinc-500 z-10">
                {chosung}
              </div>
              <div className="space-y-3 mt-2">
                {univs.map((univ) => (
                  <UniversityCard
                    key={univ.U_ID}
                    univ={univ}
                    onToggleSave={() => handleToggleSave(univ.U_ID)}
                    saving={savingId === univ.U_ID}
                    userGender={userGender}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 초성 바 - 스크롤 시 표시, 천천히 사라짐, 하단 메뉴 위로 위치 */}
      <div
        className={`fixed right-1 top-1/3 -translate-y-1/2 bg-white/90 dark:bg-zinc-800/90 rounded-full py-2 px-1 shadow-lg z-30 flex flex-col gap-0.5 transition-opacity duration-500 ${
          showChosungBar ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {초성목록.map((cho) => (
          <button
            key={cho}
            onClick={() => scrollToChosung(cho)}
            className={`text-xs w-6 h-6 rounded-full flex items-center justify-center transition ${
              groupedByChosung[cho] ? "text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" : "text-zinc-300 dark:text-zinc-600"
            }`}
            disabled={!groupedByChosung[cho]}
          >
            {cho}
          </button>
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
          <Users className="w-3 h-3" /> {/^\d+$/.test(univ.모집인원) ? `${univ.모집인원}명` : univ.모집인원}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium">
          {univ.모집군}
        </span>
      </div>

      {/* Ratio Tags - 항상 같은 위치에 표시 */}
      <div className="flex flex-wrap gap-2 mt-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          univ.수능반영비율 > 0
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700"
        }`}>
          수능 {univ.수능반영비율}%
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          univ.내신반영비율 > 0
            ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700"
        }`}>
          내신 {univ.내신반영비율}%
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          univ.실기반영비율 > 0
            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700"
        }`}>
          실기 {univ.실기반영비율}%
        </span>
      </div>

      {/* Practical Events */}
      {univ.실기종목 && (
        <p className="text-xs text-zinc-500 mt-2">
          실기종목: {univ.실기종목}
        </p>
      )}

      {/* Calculated Score - 상세보기 위에 표시 */}
      {univ.calculatedScore !== undefined && (
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700 flex justify-between items-center">
          <span className="text-sm text-zinc-500 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> 내 수능환산
          </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {univ.calculatedScore.toFixed(2)}점
          </span>
        </div>
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
    </div>
  );
}
