"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  GripVertical,
  Settings,
} from "lucide-react";
import { getToken } from "@/lib/auth";
import { createEventType, updateEventType, deleteEventType, EventType } from "@/lib/api";
import { showToast } from "@/components/toast";

interface EventSettingsProps {
  eventTypes: EventType[];
  onRefresh: () => void;
}

export default function EventSettings({ eventTypes, onRefresh }: EventSettingsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);

  const handleDelete = async (event: EventType) => {
    if (
      !confirm(
        `"${event.name}" 종목을 삭제하시겠습니까?\n\n해당 종목의 모든 기록도 함께 삭제됩니다.`
      )
    )
      return;
    const token = getToken();
    if (!token) return;
    try {
      await deleteEventType(token, event.id);
      onRefresh();
    } catch {
      showToast("error", "삭제 실패");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-zinc-500">종목을 추가하거나 수정할 수 있습니다</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition"
        >
          <Plus className="w-4 h-4" /> 종목 추가
        </button>
      </div>

      {eventTypes.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">
          <Settings className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
          <p>등록된 종목이 없습니다</p>
          <p className="text-sm mt-1">종목 추가 버튼을 눌러 추가하세요</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y dark:divide-zinc-700">
            {eventTypes.map((event, idx) => (
              <div
                key={event.id}
                className="p-4 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition"
              >
                <div className="text-zinc-300 dark:text-zinc-600">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{event.name}</p>
                    {event.is_default && (
                      <span className="text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-500 px-2 py-0.5 rounded-full">
                        기본
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                    <span className="flex items-center gap-1">
                      {event.direction === "lower" ? (
                        <>
                          <TrendingDown className="w-4 h-4 text-green-500" />
                          낮을수록 좋음
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          높을수록 좋음
                        </>
                      )}
                    </span>
                    {event.unit && (
                      <span className="text-zinc-400">단위: {event.unit}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingEvent(event)}
                    className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event)}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingEvent) && (
        <EventModal
          event={editingEvent}
          onClose={() => {
            setShowAddModal(false);
            setEditingEvent(null);
          }}
          onSave={onRefresh}
        />
      )}
    </div>
  );
}

function EventModal({
  event,
  onClose,
  onSave,
}: {
  event?: EventType | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(event?.name || "");
  const [direction, setDirection] = useState<"lower" | "higher">(
    event?.direction || "higher"
  );
  const [unit, setUnit] = useState(event?.unit || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      showToast("error", "종목명을 입력하세요");
      return;
    }
    const token = getToken();
    if (!token) return;

    setSaving(true);
    try {
      if (event) {
        await updateEventType(token, event.id, {
          name: name.trim(),
          direction,
          unit: unit.trim() || undefined,
        });
      } else {
        await createEventType(token, {
          name: name.trim(),
          direction,
          unit: unit.trim() || undefined,
        });
      }
      onSave();
      onClose();
    } catch (err: any) {
      if (err.message?.includes("unique")) {
        showToast("error", "이미 같은 이름의 종목이 있습니다");
      } else {
        showToast("error", "저장 실패");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl w-full max-w-md">
        <div className="p-4 border-b dark:border-zinc-700 flex items-center justify-between">
          <h2 className="font-bold text-lg">{event ? "종목 수정" : "종목 추가"}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">종목명</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 10m버튼"
              className="w-full px-4 py-3 border rounded-xl dark:bg-zinc-700 dark:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">방향</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection("higher")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${
                  direction === "higher"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-zinc-200 dark:border-zinc-600"
                }`}
              >
                <TrendingUp
                  className={`w-6 h-6 ${
                    direction === "higher" ? "text-blue-500" : "text-zinc-400"
                  }`}
                />
                <span className="text-sm font-medium">높을수록 좋음</span>
                <span className="text-xs text-zinc-500">제멀, 메던, 윗몸</span>
              </button>
              <button
                type="button"
                onClick={() => setDirection("lower")}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${
                  direction === "lower"
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-zinc-200 dark:border-zinc-600"
                }`}
              >
                <TrendingDown
                  className={`w-6 h-6 ${
                    direction === "lower" ? "text-green-500" : "text-zinc-400"
                  }`}
                />
                <span className="text-sm font-medium">낮을수록 좋음</span>
                <span className="text-xs text-zinc-500">10m버튼, 20m콘</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">단위 (선택)</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="예: 초, m, cm, 회"
              className="w-full px-4 py-3 border rounded-xl dark:bg-zinc-700 dark:border-zinc-600"
            />
          </div>

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
