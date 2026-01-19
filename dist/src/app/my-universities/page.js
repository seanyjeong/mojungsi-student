"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MyUniversitiesPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const auth_1 = require("@/lib/auth");
const api_1 = require("@/lib/api");
const practical_calc_1 = require("@/lib/practical-calc");
const lucide_react_1 = require("lucide-react");
const TABS = ["가군", "나군", "다군"];
function MyUniversitiesPage() {
    const router = (0, navigation_1.useRouter)();
    const { isLoggedIn, isLoading } = (0, auth_1.useAuth)();
    (0, auth_1.useRequireProfile)();
    const [saved, setSaved] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedUniv, setSelectedUniv] = (0, react_1.useState)(null);
    const [userGender, setUserGender] = (0, react_1.useState)("");
    const [activeTab, setActiveTab] = (0, react_1.useState)("가군");
    (0, react_1.useEffect)(() => {
        if (!isLoading && !isLoggedIn) {
            router.push("/");
        }
    }, [isLoading, isLoggedIn, router]);
    (0, react_1.useEffect)(() => {
        if (isLoggedIn) {
            loadSaved();
            loadUserProfile();
        }
    }, [isLoggedIn]);
    const loadUserProfile = async () => {
        const token = (0, auth_1.getToken)();
        if (!token)
            return;
        try {
            const profile = await (0, api_1.getProfile)(token);
            setUserGender(profile.gender || "");
        }
        catch (err) {
            console.error(err);
        }
    };
    const loadSaved = async () => {
        const token = (0, auth_1.getToken)();
        if (!token)
            return;
        setLoading(true);
        try {
            const data = await (0, api_1.getSavedUniversities)(token);
            const validData = data.filter((s) => s.university !== null);
            setSaved(validData);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRemove = async (uId) => {
        if (!confirm("정말 삭제하시겠습니까?"))
            return;
        const token = (0, auth_1.getToken)();
        if (!token)
            return;
        try {
            await (0, api_1.toggleSaveUniversity)(token, uId);
            setSaved((prev) => prev.filter((s) => s.U_ID !== uId));
        }
        catch (err) {
            console.error(err);
        }
    };
    const filteredByTab = (0, react_1.useMemo)(() => {
        return saved.filter((s) => s.university.모집군 === activeTab);
    }, [saved, activeTab]);
    const tabCounts = (0, react_1.useMemo)(() => {
        const counts = { 가군: 0, 나군: 0, 다군: 0 };
        saved.forEach((s) => {
            const gun = s.university.모집군;
            if (counts[gun] !== undefined) {
                counts[gun]++;
            }
        });
        return counts;
    }, [saved]);
    const calcTotalScore = (s) => {
        let total = 0;
        if (s.sunung_score)
            total += Number(s.sunung_score);
        if (s.naesin_score)
            total += Number(s.naesin_score);
        if (s.practical_score)
            total += Number(s.practical_score);
        return total;
    };
    if (isLoading || loading) {
        return (<div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"/>
      </div>);
    }
    if (!isLoggedIn) {
        return (<div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <lucide_react_1.Heart className="w-16 h-16 text-zinc-300 mb-4"/>
        <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
        <p className="text-zinc-500 mb-4">
          저장 대학 관리를 위해
          <br />
          로그인해 주세요
        </p>
      </div>);
    }
    return (<div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">내 저장 대학</h1>
        <p className="text-sm text-zinc-500">총 {saved.length}개</p>
      </div>

      
      <div className="flex gap-2">
        {TABS.map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 rounded-xl font-medium transition ${activeTab === tab
                ? "bg-blue-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
            {tab}
            {tabCounts[tab] > 0 && (<span className={`ml-1 text-xs ${activeTab === tab ? "opacity-80" : "opacity-60"}`}>
                ({tabCounts[tab]})
              </span>)}
          </button>))}
      </div>

      {saved.length === 0 ? (<div className="text-center py-10 text-zinc-500">
          <lucide_react_1.Heart className="w-12 h-12 mx-auto mb-4 text-zinc-300"/>
          <p>저장된 대학이 없습니다</p>
          <p className="text-sm mt-1">대학검색에서 하트를 눌러 저장하세요</p>
        </div>) : filteredByTab.length === 0 ? (<div className="text-center py-10 text-zinc-500">
          <p>{activeTab}에 저장된 대학이 없습니다</p>
        </div>) : (<div className="space-y-3">
          {filteredByTab.map((s) => {
                const totalScore = calcTotalScore(s);
                const hasNaesin = s.university.내신반영비율 > 0;
                return (<div key={s.id} onClick={() => setSelectedUniv(s)} className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition relative">
                <button onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(s.U_ID);
                    }} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition">
                  <lucide_react_1.Heart className="w-5 h-5 fill-current"/>
                </button>

                
                <div className="pr-10">
                  <h3 className="font-bold">{s.university.U_NM}</h3>
                  <p className="text-sm text-zinc-500">{s.university.D_NM}</p>
                </div>

                
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-xs">
                    <lucide_react_1.MapPin className="w-3 h-3"/> {s.university.지역}
                  </span>
                </div>

                
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700">
                  
                  <div className="text-center mb-2">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {totalScore > 0 ? totalScore.toFixed(1) : "-"}
                      <span className="text-sm font-normal text-zinc-500 ml-1">
                        점
                      </span>
                    </p>
                  </div>

                  
                  <div className="flex justify-center gap-4 text-xs text-zinc-500">
                    <span>
                      수능{" "}
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {s.sunung_score
                        ? Number(s.sunung_score).toFixed(1)
                        : "-"}
                      </span>
                    </span>
                    {hasNaesin && (<span>
                        내신{" "}
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {s.naesin_score
                            ? Number(s.naesin_score).toFixed(1)
                            : "-"}
                        </span>
                      </span>)}
                    <span>
                      실기{" "}
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        {s.practical_score
                        ? Number(s.practical_score).toFixed(1)
                        : "-"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>);
            })}
        </div>)}

      {selectedUniv && (<UniversityModal saved={selectedUniv} userGender={userGender} onClose={() => setSelectedUniv(null)} onUpdate={loadSaved}/>)}
    </div>);
}
function UniversityModal({ saved, userGender, onClose, onUpdate, }) {
    const [naesinScore, setNaesinScore] = (0, react_1.useState)(saved.naesin_score?.toString() || "");
    const [memo, setMemo] = (0, react_1.useState)(saved.memo || "");
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [practicalData, setPracticalData] = (0, react_1.useState)(null);
    const [practicalLoading, setPracticalLoading] = (0, react_1.useState)(false);
    const [practicalRecords, setPracticalRecords] = (0, react_1.useState)({});
    const [practicalResult, setPracticalResult] = (0, react_1.useState)(null);
    const univ = saved.university;
    const sunungScore = saved.sunung_score ? Number(saved.sunung_score) : 0;
    const hasPractical = univ.실기반영비율 > 0 && univ.실기종목 && univ.실기종목.length > 0;
    (0, react_1.useEffect)(() => {
        const loadData = async () => {
            const token = (0, auth_1.getToken)();
            if (!token)
                return;
            setPracticalLoading(true);
            try {
                const data = await (0, api_1.getPracticalScoreTable)(token, saved.U_ID, 2026, userGender);
                setPracticalData(data);
            }
            catch (err) {
                console.error("Failed to load practical data:", err);
            }
            finally {
                setPracticalLoading(false);
            }
        };
        if (hasPractical) {
            loadData();
        }
    }, [saved.U_ID, hasPractical, userGender]);
    (0, react_1.useEffect)(() => {
        if (saved.practical_records) {
            const records = {};
            for (const rec of saved.practical_records) {
                records[rec.event] = rec.record || "";
            }
            setPracticalRecords(records);
        }
    }, [saved.practical_records]);
    const calculatePractical = (0, react_1.useCallback)(() => {
        if (!practicalData || !practicalData.events.length)
            return null;
        const config = {
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
        return (0, practical_calc_1.calculatePracticalScore)(config, practicalData.scoreTable, studentRecords, userGender);
    }, [practicalData, practicalRecords, userGender, saved.U_ID]);
    (0, react_1.useEffect)(() => {
        if (practicalData) {
            const result = calculatePractical();
            setPracticalResult(result);
        }
    }, [practicalRecords, practicalData, calculatePractical]);
    const totalScore = (0, react_1.useMemo)(() => {
        let total = sunungScore;
        if (naesinScore)
            total += parseFloat(naesinScore);
        if (practicalResult)
            total += practicalResult.totalScore;
        return total;
    }, [sunungScore, naesinScore, practicalResult]);
    const handleSave = async () => {
        const token = (0, auth_1.getToken)();
        if (!token)
            return;
        setSaving(true);
        try {
            const practicalRecordsList = practicalResult?.events || [];
            await (0, api_1.updateSavedUniversity)(token, saved.U_ID, {
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
        }
        catch (err) {
            alert("저장 실패");
        }
        finally {
            setSaving(false);
        }
    };
    const handleRecordChange = (event, value) => {
        setPracticalRecords((prev) => ({
            ...prev,
            [event]: value,
        }));
    };
    return (<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        
        <div className="sticky top-0 bg-white dark:bg-zinc-800 p-4 border-b dark:border-zinc-700 flex items-center justify-between z-10">
          <h2 className="font-bold text-lg">상세 정보</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full">
            <lucide_react_1.X className="w-5 h-5"/>
          </button>
        </div>

        <div className="p-4 space-y-4">
          
          <div>
            <h3 className="font-bold text-lg">{univ.U_NM}</h3>
            <p className="text-zinc-500">{univ.D_NM}</p>
          </div>

          
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white text-center">
            <p className="text-sm opacity-80">예상 총점</p>
            <p className="text-3xl font-bold">{totalScore.toFixed(2)}점</p>
          </div>

          
          <div className={`grid gap-3 ${univ.내신반영비율 > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                수능환산
              </p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {sunungScore ? sunungScore.toFixed(1) : "-"}
              </p>
            </div>
            {univ.내신반영비율 > 0 && (<div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">내신</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {naesinScore || "-"}
                </p>
              </div>)}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">실기</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {practicalResult ? practicalResult.totalScore.toFixed(1) : "-"}
              </p>
              {practicalResult && practicalResult.totalDeduction > 0 && (<p className="text-xs text-orange-500">
                  (총 {practicalResult.totalDeduction}감)
                </p>)}
            </div>
          </div>

          
          <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-xl p-4">
            <h4 className="font-medium mb-2">반영 비율</h4>
            <div className="flex gap-4 text-sm">
              <span>수능 {univ.수능반영비율}%</span>
              {univ.내신반영비율 > 0 && <span>내신 {univ.내신반영비율}%</span>}
              {univ.실기반영비율 > 0 && <span>실기 {univ.실기반영비율}%</span>}
            </div>
          </div>

          
          {hasPractical && (<div className="space-y-3">
              <h4 className="font-medium">실기 기록 입력</h4>

              {practicalLoading ? (<div className="flex items-center justify-center py-8">
                  <lucide_react_1.Loader2 className="w-6 h-6 animate-spin text-purple-500"/>
                </div>) : practicalData && practicalData.events.length > 0 ? (<div className="space-y-2">
                  {practicalData.events.map((event) => {
                    const eventResult = practicalResult?.events.find((e) => e.event === event);
                    return (<div key={event} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-xl p-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event}</p>
                          <input type="text" value={practicalRecords[event] || ""} onChange={(e) => handleRecordChange(event, e.target.value)} placeholder="기록 입력" className="mt-1 w-full px-3 py-2 text-sm border rounded-lg dark:bg-zinc-600 dark:border-zinc-500"/>
                        </div>
                        <div className="text-right min-w-[60px]">
                          {eventResult?.score !== undefined ? (eventResult.deduction !== undefined &&
                            eventResult.deduction > 0 ? (<span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded text-sm font-medium">
                                {eventResult.deduction}감
                              </span>) : (<span className="text-green-500 text-sm">
                                만점
                              </span>)) : (<span className="text-zinc-400 text-sm">-</span>)}
                        </div>
                      </div>);
                })}
                </div>) : (<div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-xl p-4">
                  <p className="text-sm text-zinc-500">{univ.실기종목}</p>
                  <p className="text-xs text-zinc-400 mt-2">
                    * 배점표가 없습니다
                  </p>
                </div>)}
            </div>)}

          
          {univ.내신반영비율 > 0 && (<div>
              <label className="block text-sm font-medium mb-2">
                내신 점수 입력
              </label>
              <input type="number" value={naesinScore} onChange={(e) => setNaesinScore(e.target.value)} placeholder="내신 점수를 입력하세요" className="w-full px-4 py-3 border rounded-xl dark:bg-zinc-700 dark:border-zinc-600"/>
            </div>)}

          
          <div>
            <label className="block text-sm font-medium mb-2">메모</label>
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="메모를 입력하세요" rows={3} className="w-full px-4 py-3 border rounded-xl dark:bg-zinc-700 dark:border-zinc-600 resize-none"/>
          </div>

          
          <button onClick={handleSave} disabled={saving} className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50">
            {saving ? (<lucide_react_1.Loader2 className="w-5 h-5 animate-spin"/>) : (<lucide_react_1.Save className="w-5 h-5"/>)}
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map