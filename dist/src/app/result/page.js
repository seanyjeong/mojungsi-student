"use client";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ResultPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const link_1 = __importDefault(require("next/link"));
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
function ResultPage() {
    const router = (0, navigation_1.useRouter)();
    const [results, setResults] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        if (typeof window !== "undefined") {
            const stored = sessionStorage.getItem("calculationResults");
            if (stored) {
                const parsedResults = JSON.parse(stored);
                parsedResults.sort((a, b) => b.finalScore - a.finalScore);
                setResults(parsedResults);
            }
            else {
                router.push("/");
            }
            setIsLoading(false);
        }
    }, [router]);
    if (isLoading) {
        return (<div className="flex items-center justify-center py-12">
        <div className="text-zinc-600 dark:text-zinc-400">로딩 중...</div>
      </div>);
    }
    if (results.length === 0) {
        return (<div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          계산된 결과가 없습니다.
        </p>
        <link_1.default href="/" className="text-primary hover:underline">
          성적 입력하러 가기
        </link_1.default>
      </div>);
    }
    return (<div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">전체 대학 환산 결과</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          총 {results.length}개 대학 • 점수 높은 순
        </p>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (<link_1.default key={`${result.deptId}-${index}`} href={`/university/${result.deptId}`}>
            <card_1.Card className="hover:shadow-md transition-shadow cursor-pointer">
              <card_1.CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <card_1.CardTitle className="text-base mb-1">
                      {result.university.univName}
                    </card_1.CardTitle>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {result.university.deptName}
                    </p>
                  </div>
                  <lucide_react_1.ChevronRight className="h-5 w-5 text-zinc-400"/>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <badge_1.Badge variant="outline">
                      {result.university.mojipgun}군
                    </badge_1.Badge>
                    {result.university.region && (<span className="text-xs text-zinc-500">
                        {result.university.region}
                      </span>)}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {result.finalScore.toFixed(2)}
                    </div>
                    <div className="text-xs text-zinc-500">
                      / {result.scoreInfo.totalScore}점
                    </div>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </link_1.default>))}
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map