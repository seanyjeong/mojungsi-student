"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BatchCalculationResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

export default function ResultPage() {
  const router = useRouter();
  const [results, setResults] = useState<BatchCalculationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("calculationResults");
      if (stored) {
        const parsedResults: BatchCalculationResult[] = JSON.parse(stored);
        // Sort by finalScore descending
        parsedResults.sort((a, b) => b.finalScore - a.finalScore);
        setResults(parsedResults);
      } else {
        router.push("/");
      }
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-600 dark:text-zinc-400">로딩 중...</div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          계산된 결과가 없습니다.
        </p>
        <Link
          href="/"
          className="text-primary hover:underline"
        >
          성적 입력하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">전체 대학 환산 결과</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          총 {results.length}개 대학 • 점수 높은 순
        </p>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <Link
            key={`${result.deptId}-${index}`}
            href={`/university/${result.deptId}`}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-1">
                      {result.university.univName}
                    </CardTitle>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {result.university.deptName}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-zinc-400" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {result.university.mojipgun}군
                    </Badge>
                    {result.university.region && (
                      <span className="text-xs text-zinc-500">
                        {result.university.region}
                      </span>
                    )}
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
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
