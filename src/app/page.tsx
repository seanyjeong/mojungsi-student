"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScoreForm } from "@/types";
import { ScoreInputForm } from "@/components/score-input-form";
import { saveScores, loadScores } from "@/lib/storage";
import { calculateBatch } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<ScoreForm | null>(null);

  useEffect(() => {
    const saved = loadScores();
    if (saved) {
      setInitialValues(saved);
    }
  }, []);

  const handleSubmit = async (scores: ScoreForm) => {
    try {
      setIsLoading(true);
      saveScores(scores);

      // Calculate batch scores
      const results = await calculateBatch(scores, 2026);

      // Store results in sessionStorage for result page
      if (typeof window !== "undefined") {
        sessionStorage.setItem("calculationResults", JSON.stringify(results));
        sessionStorage.setItem("inputScores", JSON.stringify(scores));
      }

      router.push("/result");
    } catch (error) {
      console.error("Failed to calculate scores:", error);
      alert("점수 계산에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold mb-4">수능 성적 입력</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          표준점수, 백분위, 등급을 입력하면 196개 대학의 환산점수를
          확인할 수 있습니다.
        </p>
        {initialValues !== null && (
          <ScoreInputForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialValues={initialValues || undefined}
          />
        )}
      </div>
    </div>
  );
}
