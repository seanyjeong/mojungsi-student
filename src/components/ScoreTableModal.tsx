"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";
import { getToken } from "@/lib/auth";
import { getPracticalScoreTable, getActiveYear } from "@/lib/api";

interface ScoreRow {
  기록: string;
  배점: number;
}

interface ScoreTableData {
  events: string[];
  scoreTable: Record<string, ScoreRow[]>;
  units?: Record<string, { unit: string; direction: string }>;
}

interface ScoreTableModalProps {
  U_ID: number;
  universityName: string;
  departmentName: string;
  gender: string;
  onClose: () => void;
}

export default function ScoreTableModal({
  U_ID,
  universityName,
  departmentName,
  gender,
  onClose,
}: ScoreTableModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ScoreTableData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const token = getToken();
      if (!token) return;

      setLoading(true);
      try {
        const activeYear = await getActiveYear();
        const result = await getPracticalScoreTable(
          token,
          U_ID,
          activeYear,
          gender
        );
        setData(result);
        if (result.events && result.events.length > 0) {
          setSelectedEvent(result.events[0]);
        }
      } catch (err) {
        console.error("Failed to load score table:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [U_ID, gender]);

  // 현재 선택된 종목의 단위 정보
  const currentUnit = data?.units?.[selectedEvent];
  const unitText = currentUnit?.unit || "";

  // 현재 선택된 종목의 배점표
  const currentScoreTable = data?.scoreTable?.[selectedEvent] || [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b dark:border-zinc-700 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">배점표</h2>
            <p className="text-sm text-zinc-500">
              {universityName} - {departmentName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : !data || !data.events || data.events.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p>배점표가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 종목 선택 드롭다운 */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-700 rounded-xl flex items-center justify-between font-medium"
                >
                  <span>{selectedEvent}</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-700 rounded-xl shadow-lg border dark:border-zinc-600 z-10 max-h-48 overflow-y-auto">
                    {data.events.map((event) => (
                      <button
                        key={event}
                        onClick={() => {
                          setSelectedEvent(event);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-zinc-100 dark:hover:bg-zinc-600 first:rounded-t-xl last:rounded-b-xl ${
                          event === selectedEvent
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : ""
                        }`}
                      >
                        {event}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 배점 테이블 */}
              {currentScoreTable.length > 0 ? (
                <div className="border dark:border-zinc-700 rounded-xl overflow-hidden">
                  {/* 테이블 헤더 */}
                  <div className="grid grid-cols-2 bg-zinc-100 dark:bg-zinc-700">
                    <div className="px-4 py-3 font-medium text-center border-r dark:border-zinc-600">
                      기록 {unitText && <span className="text-zinc-400">({unitText})</span>}
                    </div>
                    <div className="px-4 py-3 font-medium text-center">
                      배점
                    </div>
                  </div>

                  {/* 테이블 바디 */}
                  <div className="max-h-[40vh] overflow-y-auto">
                    {currentScoreTable.map((row, idx) => (
                      <div
                        key={idx}
                        className={`grid grid-cols-2 ${
                          idx % 2 === 0
                            ? "bg-white dark:bg-zinc-800"
                            : "bg-zinc-50 dark:bg-zinc-750"
                        }`}
                      >
                        <div className="px-4 py-2.5 text-center border-r dark:border-zinc-700">
                          {row.기록}
                          {unitText && (
                            <span className="text-zinc-400 text-sm ml-0.5">
                              {unitText}
                            </span>
                          )}
                        </div>
                        <div className="px-4 py-2.5 text-center font-medium">
                          {row.배점}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <p>이 종목의 배점표가 없습니다</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
