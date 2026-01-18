"use client";

import { useState, useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import { TrendingUp, TrendingDown, Trophy, Activity } from "lucide-react";
import { getToken } from "@/lib/auth";
import { getPracticalHistory, EventType, HistoryData } from "@/lib/api";

interface GrowthChartProps {
  eventTypes: EventType[];
}

export default function GrowthChart({ eventTypes }: GrowthChartProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventTypes.length > 0 && !selectedEvent) {
      setSelectedEvent(eventTypes[0].name);
    }
  }, [eventTypes, selectedEvent]);

  useEffect(() => {
    if (selectedEvent) {
      loadHistory(selectedEvent);
    }
  }, [selectedEvent]);

  const loadHistory = async (eventName: string) => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const data = await getPracticalHistory(token, eventName);
      setHistoryData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedEventType = eventTypes.find((et) => et.name === selectedEvent);

  // 그래프 데이터 준비
  const chartData =
    historyData?.records
      .filter((r) => r.numeric_record && r.record_date)
      .map((r) => ({
        x: r.record_date!.split("T")[0],
        y: parseFloat(r.numeric_record!),
        record: r.record,
        memo: r.memo,
      })) || [];

  const nivoData = [
    {
      id: selectedEvent,
      data: chartData,
    },
  ];

  // PB 인덱스 찾기
  let pbIndex = -1;
  if (chartData.length > 0 && selectedEventType) {
    if (selectedEventType.direction === "lower") {
      const minVal = Math.min(...chartData.map((d) => d.y));
      pbIndex = chartData.findIndex((d) => d.y === minVal);
    } else {
      const maxVal = Math.max(...chartData.map((d) => d.y));
      pbIndex = chartData.findIndex((d) => d.y === maxVal);
    }
  }

  return (
    <div className="space-y-4">
      {/* 종목 선택 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {eventTypes.map((event) => (
          <button
            key={event.id}
            onClick={() => setSelectedEvent(event.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              selectedEvent === event.name
                ? "bg-blue-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
            }`}
          >
            {event.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
          <Activity className="w-12 h-12 mb-4 text-zinc-300" />
          <p>기록이 없습니다</p>
          <p className="text-sm mt-1">기록 관리 탭에서 기록을 추가하세요</p>
        </div>
      ) : (
        <>
          {/* 통계 카드 */}
          {historyData?.stats && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                  <Activity className="w-4 h-4" />
                  현재
                </div>
                <p className="text-xl font-bold">
                  {historyData.stats.current}
                  {selectedEventType?.unit && (
                    <span className="text-sm font-normal text-zinc-400">
                      {selectedEventType.unit}
                    </span>
                  )}
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-4 shadow-sm text-white">
                <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                  <Trophy className="w-4 h-4" />
                  PB
                </div>
                <p className="text-xl font-bold">
                  {historyData.stats.pb}
                  {selectedEventType?.unit && (
                    <span className="text-sm font-normal text-white/80">
                      {selectedEventType.unit}
                    </span>
                  )}
                </p>
              </div>
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
                  {selectedEventType?.direction === "lower" ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  평균
                </div>
                <p className="text-xl font-bold">
                  {historyData.stats.average}
                  {selectedEventType?.unit && (
                    <span className="text-sm font-normal text-zinc-400">
                      {selectedEventType.unit}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* 그래프 */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              {selectedEventType?.direction === "lower" ? (
                <TrendingDown className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingUp className="w-5 h-5 text-blue-500" />
              )}
              {selectedEvent} 성장 그래프
            </h3>
            <div className="h-64">
              <ResponsiveLine
                data={nivoData}
                margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
                xScale={{
                  type: "point",
                }}
                yScale={{
                  type: "linear",
                  min: "auto",
                  max: "auto",
                  reverse: selectedEventType?.direction === "lower",
                }}
                curve="monotoneX"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  format: (v) => {
                    const date = new Date(v);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  },
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                colors={["#3b82f6"]}
                lineWidth={3}
                pointSize={10}
                pointColor={"white"}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                pointLabelYOffset={-12}
                enableArea={true}
                areaOpacity={0.1}
                useMesh={true}
                tooltip={({ point }) => {
                  const pointIndex = chartData.findIndex(d => d.x === point.data.x);
                  const dataPoint = chartData[pointIndex];
                  const isPB = pointIndex === pbIndex;
                  return (
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-3 border dark:border-zinc-700">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">
                          {dataPoint?.record || point.data.y}
                        </p>
                        {isPB && (
                          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            PB
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        {new Date(point.data.x as string).toLocaleDateString("ko-KR")}
                      </p>
                      {dataPoint?.memo && (
                        <p className="text-xs text-zinc-400 mt-1">{dataPoint.memo}</p>
                      )}
                    </div>
                  );
                }}
                theme={{
                  axis: {
                    ticks: {
                      text: {
                        fill: "#71717a",
                      },
                    },
                  },
                  grid: {
                    line: {
                      stroke: "#e4e4e7",
                      strokeWidth: 1,
                    },
                  },
                  crosshair: {
                    line: {
                      stroke: "#3b82f6",
                      strokeWidth: 1,
                      strokeOpacity: 0.5,
                    },
                  },
                }}
              />
            </div>
            {selectedEventType?.direction === "lower" && (
              <p className="text-xs text-zinc-500 text-center mt-2">
                이 종목은 낮을수록 좋은 기록입니다 (그래프가 위로 갈수록 좋음)
              </p>
            )}
          </div>

          {/* 기록 목록 */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b dark:border-zinc-700">
              <h3 className="font-bold">기록 목록</h3>
            </div>
            <div className="divide-y dark:divide-zinc-700 max-h-64 overflow-y-auto">
              {historyData?.records
                .slice()
                .reverse()
                .map((record, idx) => {
                  const isPB =
                    chartData.length > 0 &&
                    pbIndex >= 0 &&
                    chartData[pbIndex]?.x === record.record_date?.split("T")[0];
                  return (
                    <div key={record.id} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 text-center text-zinc-400 text-sm">
                          {historyData.records.length - idx}
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {record.record || "-"}
                            {isPB && (
                              <Trophy className="w-4 h-4 text-amber-500" />
                            )}
                          </p>
                          {record.record_date && (
                            <p className="text-xs text-zinc-500">
                              {new Date(record.record_date).toLocaleDateString("ko-KR")}
                            </p>
                          )}
                        </div>
                      </div>
                      {record.memo && (
                        <p className="text-xs text-zinc-400 max-w-32 truncate">
                          {record.memo}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
