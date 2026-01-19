"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SearchPage;
const react_1 = require("react");
const auth_1 = require("@/lib/auth");
const api_1 = require("@/lib/api");
const lucide_react_1 = require("lucide-react");
function getChosung(str) {
    const cho = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    const code = str.charCodeAt(0) - 44032;
    if (code < 0 || code > 11171)
        return "";
    return cho[Math.floor(code / 588)];
}
const 초성목록 = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
function convertDbScoresToScoreForm(data) {
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
function transformApiResponse(apiData) {
    const result = [];
    for (const univ of apiData) {
        if (!univ.departments)
            continue;
        for (const dept of univ.departments) {
            const fc = dept.formula_configs;
            const config = fc?.display_config || {};
            const ratios = config.비율 || {};
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
            const practicalEvents = dept.practical_events?.join(', ') || config.실기종목 || "";
            const legacyUid = fc?.legacy_uid || dept.dept_id;
            result.push({
                U_ID: legacyUid,
                U_NM: univ.univ_name,
                D_NM: dept.dept_name,
                지역: dept.region || univ.region || "미정",
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
const 군목록 = ["전체", "가군", "나군", "다군"];
const 지역목록 = ["서울", "경기", "인천", "강원", "충북", "충남", "대전", "세종", "전북", "전남", "광주", "경북", "경남", "대구", "울산", "부산", "제주"];
function SearchPage() {
    const { isLoggedIn } = (0, auth_1.useAuth)();
    const { isProfileComplete } = (0, auth_1.useRequireProfile)();
    const [universities, setUniversities] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedGun, setSelectedGun] = (0, react_1.useState)("전체");
    const [selectedRegions, setSelectedRegions] = (0, react_1.useState)([]);
    const [showFilter, setShowFilter] = (0, react_1.useState)(false);
    const [searchText, setSearchText] = (0, react_1.useState)("");
    const [savingId, setSavingId] = (0, react_1.useState)(null);
    const [userGender, setUserGender] = (0, react_1.useState)(null);
    const [showChosungBar, setShowChosungBar] = (0, react_1.useState)(false);
    const listRef = (0, react_1.useRef)(null);
    const chosungRefs = (0, react_1.useRef)({});
    (0, react_1.useEffect)(() => {
        let hideTimer;
        const handleScroll = () => {
            if (window.scrollY > 200) {
                setShowChosungBar(true);
                clearTimeout(hideTimer);
                hideTimer = setTimeout(() => {
                    setShowChosungBar(false);
                }, 2000);
            }
            else {
                setShowChosungBar(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(hideTimer);
        };
    }, []);
    const toggleRegion = (region) => {
        setSelectedRegions(prev => prev.includes(region)
            ? prev.filter(r => r !== region)
            : [...prev, region]);
    };
    const scrollToChosung = (chosung) => {
        const ref = chosungRefs.current[chosung];
        if (ref) {
            ref.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };
    const loadData = (0, react_1.useCallback)(async () => {
        setLoading(true);
        try {
            const rawData = await (0, api_1.getUniversities)(2026);
            const data = transformApiResponse(rawData);
            let scores = null;
            const token = (0, auth_1.getToken)();
            if (token) {
                try {
                    const dbScores = await (0, api_1.getScores)(token, 2026);
                    if (dbScores && dbScores.length > 0 && dbScores[0].scores) {
                        scores = convertDbScoresToScoreForm(dbScores[0].scores);
                    }
                }
                catch {
                }
            }
            let calculated = data;
            if (scores && Object.keys(scores).length > 0) {
                try {
                    const response = await (0, api_1.calculateAll)(scores, 2026);
                    const scoreMap = new Map(response.results.map((r) => [
                        `${r.university?.univName}_${r.university?.deptName}`,
                        r.finalScore,
                    ]));
                    calculated = data.map((u) => ({
                        ...u,
                        calculatedScore: scoreMap.get(`${u.U_NM}_${u.D_NM}`),
                    }));
                }
                catch (err) {
                    console.error("Calculation error:", err);
                }
            }
            if (isLoggedIn) {
                const token = (0, auth_1.getToken)();
                if (token) {
                    try {
                        const profile = await (0, api_1.getProfile)(token);
                        setUserGender(profile.gender || null);
                    }
                    catch {
                    }
                    const withSaved = await Promise.all(calculated.map(async (u) => {
                        try {
                            const { saved } = await (0, api_1.checkIsSaved)(token, u.U_ID);
                            return { ...u, isSaved: saved };
                        }
                        catch {
                            return u;
                        }
                    }));
                    calculated = withSaved;
                }
            }
            setUniversities(calculated);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    }, [isLoggedIn]);
    (0, react_1.useEffect)(() => {
        loadData();
    }, [loadData]);
    const handleToggleSave = async (uId) => {
        if (!isLoggedIn) {
            alert("로그인이 필요합니다");
            return;
        }
        const token = (0, auth_1.getToken)();
        if (!token)
            return;
        const univ = universities.find((u) => u.U_ID === uId);
        const score = univ?.calculatedScore;
        setSavingId(uId);
        try {
            const { saved } = await (0, api_1.toggleSaveUniversity)(token, uId, score);
            setUniversities((prev) => prev.map((u) => (u.U_ID === uId ? { ...u, isSaved: saved } : u)));
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setSavingId(null);
        }
    };
    const filteredUniversities = (0, react_1.useMemo)(() => {
        return universities.filter((u) => {
            if (selectedGun !== "전체" && u.모집군 !== selectedGun)
                return false;
            if (selectedRegions.length > 0 && !selectedRegions.includes(u.지역))
                return false;
            if (searchText) {
                const search = searchText.toLowerCase();
                if (!u.U_NM.toLowerCase().includes(search) &&
                    !u.D_NM.toLowerCase().includes(search)) {
                    return false;
                }
            }
            return true;
        });
    }, [universities, selectedGun, selectedRegions, searchText]);
    const groupedByChosung = (0, react_1.useMemo)(() => {
        const groups = {};
        filteredUniversities.forEach(u => {
            const cho = getChosung(u.U_NM);
            const normalizedCho = cho === "ㄲ" ? "ㄱ" : cho === "ㄸ" ? "ㄷ" : cho === "ㅃ" ? "ㅂ" : cho === "ㅆ" ? "ㅅ" : cho === "ㅉ" ? "ㅈ" : cho;
            if (normalizedCho && 초성목록.includes(normalizedCho)) {
                if (!groups[normalizedCho])
                    groups[normalizedCho] = [];
                groups[normalizedCho].push(u);
            }
        });
        return groups;
    }, [filteredUniversities]);
    if (loading) {
        return (<div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
      </div>);
    }
    if (!isLoggedIn) {
        return (<div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <lucide_react_1.Heart className="w-16 h-16 text-zinc-300 mb-4"/>
        <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
        <p className="text-zinc-500 mb-4">대학 검색 및 환산점수 확인을 위해<br />로그인해 주세요</p>
      </div>);
    }
    return (<div className="space-y-4 pb-20">
      
      <div className="flex gap-2">
        <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="대학/학과 검색..." className="flex-1 px-4 py-3 border rounded-xl bg-white dark:bg-zinc-800 dark:border-zinc-700"/>
        <button onClick={() => setShowFilter(!showFilter)} className={`px-4 py-3 rounded-xl border transition ${showFilter ? "bg-blue-500 text-white border-blue-500" : "bg-white dark:bg-zinc-800 dark:border-zinc-700"}`}>
          <lucide_react_1.Filter className="w-5 h-5"/>
        </button>
      </div>

      
      {showFilter && (<div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">모집군</label>
            <div className="flex flex-wrap gap-2">
              {군목록.map((gun) => (<button key={gun} onClick={() => setSelectedGun(gun)} className={`px-3 py-1.5 rounded-full text-sm transition ${selectedGun === gun
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"}`}>
                  {gun}
                </button>))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">
              지역 {selectedRegions.length > 0 && <span className="text-blue-500">({selectedRegions.length}개 선택)</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {지역목록.map((region) => (<button key={region} onClick={() => toggleRegion(region)} className={`px-3 py-1.5 rounded-full text-sm transition ${selectedRegions.includes(region)
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"}`}>
                  {region}
                </button>))}
            </div>
          </div>
          <button onClick={() => {
                setSelectedGun("전체");
                setSelectedRegions([]);
                setSearchText("");
            }} className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-700">
            필터 초기화
          </button>
        </div>)}

      
      <div className="flex justify-center gap-2">
        {군목록.map((gun) => (<button key={gun} onClick={() => setSelectedGun(gun)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedGun === gun
                ? "bg-blue-500 text-white"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border dark:border-zinc-700"}`}>
            {gun}
          </button>))}
      </div>

      
      <p className="text-sm text-zinc-500 text-center">
        총 {filteredUniversities.length}개 대학
        {selectedRegions.length > 0 && ` (${selectedRegions.join(", ")})`}
      </p>

      
      <div className="space-y-3 relative" ref={listRef}>
        {초성목록.map((chosung) => {
            const univs = groupedByChosung[chosung];
            if (!univs || univs.length === 0)
                return null;
            return (<div key={chosung} ref={(el) => { chosungRefs.current[chosung] = el; }}>
              <div className="sticky top-0 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-sm font-bold text-zinc-500 z-10">
                {chosung}
              </div>
              <div className="space-y-3 mt-2">
                {univs.map((univ) => (<UniversityCard key={univ.U_ID} univ={univ} onToggleSave={() => handleToggleSave(univ.U_ID)} saving={savingId === univ.U_ID} userGender={userGender}/>))}
              </div>
            </div>);
        })}
      </div>

      
      <div className={`fixed right-1 top-1/3 -translate-y-1/2 bg-white/90 dark:bg-zinc-800/90 rounded-full py-2 px-1 shadow-lg z-30 flex flex-col gap-0.5 transition-opacity duration-500 ${showChosungBar ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {초성목록.map((cho) => (<button key={cho} onClick={() => scrollToChosung(cho)} className={`text-xs w-6 h-6 rounded-full flex items-center justify-center transition ${groupedByChosung[cho] ? "text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" : "text-zinc-300 dark:text-zinc-600"}`} disabled={!groupedByChosung[cho]}>
            {cho}
          </button>))}
      </div>

      {filteredUniversities.length === 0 && (<div className="text-center py-10 text-zinc-500">
          검색 결과가 없습니다
        </div>)}
    </div>);
}
function UniversityCard({ univ, onToggleSave, saving, userGender, }) {
    const [expanded, setExpanded] = (0, react_1.useState)(false);
    const isRestricted = univ.isWomensUniv && userGender === "남";
    return (<div className={`rounded-xl p-4 shadow-sm relative ${isRestricted
            ? "bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800"
            : "bg-white dark:bg-zinc-800"}`}>
      
      {isRestricted && (<div className="mb-3 px-3 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 text-xs font-medium">
          여자대학교 - 남성은 지원할 수 없습니다
        </div>)}

      
      <button onClick={onToggleSave} disabled={saving || isRestricted} title={isRestricted ? "여대는 저장할 수 없습니다" : undefined} className={`absolute top-4 right-4 p-2 rounded-full transition ${isRestricted
            ? "text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
            : univ.isSaved
                ? "text-red-500"
                : "text-zinc-400 hover:text-red-400"}`}>
        <lucide_react_1.Heart className={`w-5 h-5 ${univ.isSaved && !isRestricted ? "fill-current" : ""}`}/>
      </button>

      
      <div className="pr-10">
        <h3 className="font-bold text-lg">{univ.U_NM}</h3>
        <p className="text-zinc-500 text-sm">{univ.D_NM}</p>
      </div>

      
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-xs">
          <lucide_react_1.MapPin className="w-3 h-3"/> {univ.지역}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-xs">
          <lucide_react_1.Users className="w-3 h-3"/> {univ.모집인원}명
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium">
          {univ.모집군}
        </span>
      </div>

      
      <div className="flex flex-wrap gap-2 mt-2">
        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded text-xs font-medium">
          수능 {univ.수능반영비율}%
        </span>
        {univ.내신반영비율 > 0 && (<span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded text-xs font-medium">
            내신 {univ.내신반영비율}%
          </span>)}
        <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded text-xs font-medium">
          실기 {univ.실기반영비율}%
        </span>
      </div>

      
      {univ.실기종목 && (<p className="text-xs text-zinc-500 mt-2">
          실기종목: {univ.실기종목}
        </p>)}

      
      {univ.calculatedScore !== undefined && (<div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700 flex justify-between items-center">
          <span className="text-sm text-zinc-500 flex items-center gap-1">
            <lucide_react_1.TrendingUp className="w-4 h-4"/> 내 수능환산
          </span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {univ.calculatedScore.toFixed(2)}점
          </span>
        </div>)}

      
      <button onClick={() => setExpanded(!expanded)} className="flex items-center justify-center w-full mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700 text-sm text-zinc-500">
        {expanded ? (<>
            접기 <lucide_react_1.ChevronUp className="w-4 h-4 ml-1"/>
          </>) : (<>
            상세보기 <lucide_react_1.ChevronDown className="w-4 h-4 ml-1"/>
          </>)}
      </button>

      
      {expanded && (<div className="mt-3 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-700">
          
          {univ.subjectDisplay && (<div>
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
                    {univ.subjectDisplay.inquiry_count && (<span className="text-zinc-400 ml-1">({univ.subjectDisplay.inquiry_count}과목)</span>)}
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
            </div>)}
        </div>)}
    </div>);
}
//# sourceMappingURL=page.js.map