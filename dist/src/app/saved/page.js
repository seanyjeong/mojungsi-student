"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SavedPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const storage_1 = require("@/lib/storage");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
function SavedPage() {
    const router = (0, navigation_1.useRouter)();
    const [savedScores, setSavedScores] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const scores = (0, storage_1.loadScores)();
        setSavedScores(scores);
    }, []);
    const handleClear = () => {
        if (confirm("저장된 성적을 삭제하시겠습니까?")) {
            (0, storage_1.clearScores)();
            setSavedScores(null);
        }
    };
    const handleUse = () => {
        router.push("/");
    };
    if (!savedScores) {
        return (<div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          저장된 성적이 없습니다.
        </p>
        <button_1.Button onClick={() => router.push("/")}>
          성적 입력하러 가기
        </button_1.Button>
      </div>);
    }
    return (<div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">저장된 성적</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          마지막으로 입력한 성적 정보입니다.
        </p>
      </div>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>수능 성적</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                국어 ({savedScores.korean.subject})
              </div>
              <div className="text-sm">
                표준 {savedScores.korean.std} / 백분위{" "}
                {savedScores.korean.pct} / {savedScores.korean.grade}등급
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                수학 ({savedScores.math.subject})
              </div>
              <div className="text-sm">
                표준 {savedScores.math.std} / 백분위 {savedScores.math.pct} /{" "}
                {savedScores.math.grade}등급
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                영어
              </div>
              <div className="text-sm">{savedScores.english.grade}등급</div>
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                한국사
              </div>
              <div className="text-sm">{savedScores.history.grade}등급</div>
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                탐구1 ({savedScores.inquiry1.subject})
              </div>
              <div className="text-sm">
                표준 {savedScores.inquiry1.std} / 백분위{" "}
                {savedScores.inquiry1.pct} / {savedScores.inquiry1.grade}등급
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                탐구2 ({savedScores.inquiry2.subject})
              </div>
              <div className="text-sm">
                표준 {savedScores.inquiry2.std} / 백분위{" "}
                {savedScores.inquiry2.pct} / {savedScores.inquiry2.grade}등급
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button_1.Button onClick={handleUse} className="flex-1">
              <lucide_react_1.Calculator className="h-4 w-4 mr-2"/>
              이 성적으로 계산하기
            </button_1.Button>
            <button_1.Button onClick={handleClear} variant="outline" className="flex-1">
              <lucide_react_1.Trash2 className="h-4 w-4 mr-2"/>
              삭제
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
//# sourceMappingURL=page.js.map