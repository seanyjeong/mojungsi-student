"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BatchCalculationResult, ScoreForm } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function UniversityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<BatchCalculationResult | null>(null);
  const [inputScores, setInputScores] = useState<ScoreForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const deptId = parseInt(params.id as string);

    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("calculationResults");
      const scoresStored = sessionStorage.getItem("inputScores");

      if (stored && scoresStored) {
        const results: BatchCalculationResult[] = JSON.parse(stored);
        const scores: ScoreForm = JSON.parse(scoresStored);
        const found = results.find((r) => r.deptId === deptId);

        if (found) {
          setResult(found);
          setInputScores(scores);
        } else {
          router.push("/result");
        }
      } else {
        router.push("/");
      }
      setIsLoading(false);
    }
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-600 dark:text-zinc-400">로딩 중...</div>
      </div>
    );
  }

  if (!result || !inputScores) {
    return null;
  }

  const suneungRatio = (
    (result.scoreInfo.suneungMaxScore / result.scoreInfo.totalScore) *
    100
  ).toFixed(0);
  const silgiRatio = (
    (result.scoreInfo.silgiMaxScore / result.scoreInfo.totalScore) *
    100
  ).toFixed(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/result">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">
            {result.university.univName}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {result.university.deptName}
          </p>
        </div>
      </div>

      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              모집군
            </span>
            <Badge variant="outline">{result.university.mojipgun}군</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              모집인원
            </span>
            <span className="font-medium">{result.university.mojipInwon}명</span>
          </div>
          {result.university.region && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                지역
              </span>
              <span className="font-medium">{result.university.region}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 환산 점수 */}
      <Card>
        <CardHeader>
          <CardTitle>환산 점수</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 border-b border-zinc-200 dark:border-zinc-700 mb-6">
            <div className="text-4xl font-bold text-primary mb-2">
              {result.finalScore.toFixed(2)}
            </div>
            <div className="text-zinc-600 dark:text-zinc-400">
              / {result.scoreInfo.totalScore}점
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                국어
              </span>
              <span className="font-medium">
                {result.breakdown.korean.toFixed(2)}점
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                수학
              </span>
              <span className="font-medium">
                {result.breakdown.math.toFixed(2)}점
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                영어
              </span>
              <span className="font-medium">
                {result.breakdown.english.toFixed(2)}점
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                탐구
              </span>
              <span className="font-medium">
                {result.breakdown.inquiry.toFixed(2)}점
              </span>
            </div>
            {result.breakdown.history > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  한국사 가산점
                </span>
                <span className="font-medium text-green-600">
                  +{result.breakdown.history.toFixed(2)}점
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 전형 비율 */}
      <Card>
        <CardHeader>
          <CardTitle>전형 비율</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">수능</span>
              <span className="text-sm font-medium">{suneungRatio}%</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${suneungRatio}%` }}
              />
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {result.scoreInfo.suneungMaxScore}점
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">실기</span>
              <span className="text-sm font-medium">{silgiRatio}%</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
              <div
                className="bg-zinc-400 dark:bg-zinc-600 h-2 rounded-full"
                style={{ width: `${silgiRatio}%` }}
              />
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {result.scoreInfo.silgiMaxScore}점
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 입력한 성적 */}
      <Card>
        <CardHeader>
          <CardTitle>입력한 성적</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">국어</span>
            <span>
              {inputScores.korean.subject} / 표준 {inputScores.korean.std} /
              백분위 {inputScores.korean.pct} / {inputScores.korean.grade}등급
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">수학</span>
            <span>
              {inputScores.math.subject} / 표준 {inputScores.math.std} / 백분위{" "}
              {inputScores.math.pct} / {inputScores.math.grade}등급
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">영어</span>
            <span>{inputScores.english.grade}등급</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">한국사</span>
            <span>{inputScores.history.grade}등급</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">탐구1</span>
            <span>
              {inputScores.inquiry1.subject} / 표준 {inputScores.inquiry1.std} /
              백분위 {inputScores.inquiry1.pct} / {inputScores.inquiry1.grade}
              등급
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">탐구2</span>
            <span>
              {inputScores.inquiry2.subject} / 표준 {inputScores.inquiry2.std} /
              백분위 {inputScores.inquiry2.pct} / {inputScores.inquiry2.grade}
              등급
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
