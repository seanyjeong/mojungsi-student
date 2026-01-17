"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getToken } from "@/lib/auth";
import {
  getSavedUniversities,
  toggleSaveUniversity,
  updateSavedUniversity,
  calculateScore,
} from "@/lib/api";
import { loadScores } from "@/lib/storage";
import { Heart, MapPin, X, Save } from "lucide-react";

interface SavedUniversity {
  id: number;
  U_ID: number;
  naesin_score: number | null;
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
  };
}

export default function MyUniversitiesPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const [saved, setSaved] = useState<SavedUniversity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUniv, setSelectedUniv] = useState<SavedUniversity | null>(null);
  const [calculatedScores, setCalculatedScores] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) {
      loadSaved();
    }
  }, [isLoggedIn]);

  const loadSaved = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await getSavedUniversities(token);
      setSaved(data);

      // Calculate scores for each saved university
      const scores = loadScores();
      if (scores && Object.keys(scores).length > 0) {
        const scoreMap: Record<number, number> = {};
        await Promise.all(
          data.map(async (s: SavedUniversity) => {
            try {
              const result = await calculateScore(s.U_ID, scores);
              if (result?.finalScore) {
                scoreMap[s.U_ID] = result.finalScore;
              }
            } catch {
              // ignore
            }
          })
        );
        setCalculatedScores(scoreMap);
      }
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

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-xl font-bold">내 저장 대학</h1>
      <p className="text-sm text-zinc-500">
        저장된 대학: {saved.length}개
      </p>

      {saved.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">
          <Heart className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
          <p>저장된 대학이 없습니다</p>
          <p className="text-sm mt-1">대학검색에서 하트를 눌러 저장하세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {saved.map((s) => (
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

              <div className="pr-10">
                <h3 className="font-bold">{s.university.U_NM}</h3>
                <p className="text-sm text-zinc-500">{s.university.D_NM}</p>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-xs">
                  <MapPin className="w-3 h-3" /> {s.university.지역}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                  {s.university.모집군}
                </span>
              </div>

              {/* Score Summary */}
              <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-700 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-zinc-500">환산점수</p>
                  <p className="font-bold text-blue-600">
                    {calculatedScores[s.U_ID]?.toFixed(1) || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">내신</p>
                  <p className="font-bold text-green-600">
                    {s.naesin_score?.toFixed(1) || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">실기</p>
                  <p className="font-bold text-purple-600">-</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedUniv && (
        <UniversityModal
          saved={selectedUniv}
          calculatedScore={calculatedScores[selectedUniv.U_ID]}
          onClose={() => setSelectedUniv(null)}
          onUpdate={loadSaved}
        />
      )}
    </div>
  );
}

function UniversityModal({
  saved,
  calculatedScore,
  onClose,
  onUpdate,
}: {
  saved: SavedUniversity;
  calculatedScore?: number;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [naesinScore, setNaesinScore] = useState(saved.naesin_score?.toString() || "");
  const [memo, setMemo] = useState(saved.memo || "");
  const [saving, setSaving] = useState(false);

  const univ = saved.university;

  // Calculate total score
  const totalScore = useMemo(() => {
    let total = 0;
    if (calculatedScore) total += calculatedScore;
    if (naesinScore) total += parseFloat(naesinScore);
    // TODO: Add practical score
    return total;
  }, [calculatedScore, naesinScore]);

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      await updateSavedUniversity(token, saved.U_ID, {
        naesin_score: naesinScore ? parseFloat(naesinScore) : undefined,
        memo: memo || undefined,
      });
      onUpdate();
      onClose();
    } catch (err) {
      alert("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-800 p-4 border-b dark:border-zinc-700 flex items-center justify-between">
          <h2 className="font-bold text-lg">상세 정보</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full">
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
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">환산점수</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {calculatedScore?.toFixed(1) || "-"}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">내신</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {naesinScore || "-"}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">실기</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">-</p>
            </div>
          </div>

          {/* Ratio Info */}
          <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-xl p-4">
            <h4 className="font-medium mb-2">반영 비율</h4>
            <div className="flex gap-4 text-sm">
              <span>수능 {univ.수능반영비율}%</span>
              {univ.내신반영비율 > 0 && <span>내신 {univ.내신반영비율}%</span>}
              <span>실기 {univ.실기반영비율}%</span>
            </div>
          </div>

          {/* Naesin Input */}
          {univ.내신반영비율 > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">내신 점수 입력</label>
              <input
                type="number"
                value={naesinScore}
                onChange={(e) => setNaesinScore(e.target.value)}
                placeholder="내신 점수를 입력하세요"
                className="w-full px-4 py-3 border rounded-xl dark:bg-zinc-700 dark:border-zinc-600"
              />
            </div>
          )}

          {/* Practical Events */}
          {univ.실기종목 && (
            <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-xl p-4">
              <h4 className="font-medium mb-2">실기 종목</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{univ.실기종목}</p>
              <p className="text-xs text-zinc-500 mt-2">
                * 실기 점수는 실기관리 페이지에서 기록을 입력하세요
              </p>
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

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Save className="w-5 h-5" />
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
