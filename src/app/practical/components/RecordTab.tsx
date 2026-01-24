"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Save, X, Dumbbell, Calendar, FileText } from "lucide-react";
import { getToken } from "@/lib/auth";
import {
  createPracticalRecord,
  updatePracticalRecord,
  deletePracticalRecord,
  EventType,
} from "@/lib/api";

interface PracticalRecord {
  id: number;
  event_name: string;
  record: string | null;
  record_date: string | null;
  memo: string | null;
}

interface RecordTabProps {
  records: PracticalRecord[];
  eventTypes: EventType[];
  onRefresh: () => void;
}

export default function RecordTab({ records, eventTypes, onRefresh }: RecordTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PracticalRecord | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const token = getToken();
    if (!token) return;
    try {
      await deletePracticalRecord(token, id);
      onRefresh();
    } catch {
      alert("삭제 실패");
    }
  };

  // Group records by event
  const groupedRecords = records.reduce((acc, record) => {
    if (!acc[record.event_name]) {
      acc[record.event_name] = [];
    }
    acc[record.event_name].push(record);
    return acc;
  }, {} as Record<string, PracticalRecord[]>);

  // eventTypes 순서대로 정렬
  const sortedEventNames = eventTypes
    .map((et) => et.name)
    .filter((name) => groupedRecords[name]);

  // eventTypes에 없는 종목도 표시
  const otherEventNames = Object.keys(groupedRecords).filter(
    (name) => !sortedEventNames.includes(name)
  );
  const allEventNames = [...sortedEventNames, ...otherEventNames];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition"
        >
          <Plus className="w-4 h-4" /> 기록 추가
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-10 text-zinc-500">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
          <p>등록된 실기 기록이 없습니다</p>
          <p className="text-sm mt-1">기록 추가 버튼을 눌러 추가하세요</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allEventNames.map((eventName) => {
            const eventRecords = groupedRecords[eventName];
            const eventType = eventTypes.find((et) => et.name === eventName);
            return (
              <div
                key={eventName}
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" /> {eventName}
                    {eventType?.unit && (
                      <span className="text-sm font-normal opacity-80">
                        ({eventType.unit})
                      </span>
                    )}
                  </h3>
                </div>
                <div className="divide-y dark:divide-zinc-700">
                  {eventRecords.map((record) => (
                    <div key={record.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                          {record.record || "-"}
                        </p>
                        {record.record_date && (
                          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(record.record_date).toLocaleDateString("ko-KR")}
                          </p>
                        )}
                        {record.memo && (
                          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                            <FileText className="w-3 h-3" />
                            {record.memo}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingRecord(record)}
                          className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <RecordModal
          eventTypes={eventTypes}
          onClose={() => setShowAddModal(false)}
          onSave={onRefresh}
        />
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <RecordModal
          eventTypes={eventTypes}
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={onRefresh}
        />
      )}
    </div>
  );
}

function RecordModal({
  record,
  eventTypes,
  onClose,
  onSave,
}: {
  record?: PracticalRecord;
  eventTypes: EventType[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [eventName, setEventName] = useState(record?.event_name || "");
  const [recordValue, setRecordValue] = useState(record?.record || "");
  const [recordDate, setRecordDate] = useState(
    record?.record_date ? record.record_date.split("T")[0] : ""
  );
  const [memo, setMemo] = useState(record?.memo || "");
  const [saving, setSaving] = useState(false);

  const selectedEventType = eventTypes.find((et) => et.name === eventName);

  const handleSave = async () => {
    if (!eventName) {
      alert("종목을 선택하세요");
      return;
    }
    const token = getToken();
    if (!token) return;

    setSaving(true);
    try {
      if (record) {
        await updatePracticalRecord(token, record.id, {
          record: recordValue || undefined,
          record_date: recordDate || undefined,
          memo: memo || undefined,
        });
      } else {
        await createPracticalRecord(token, {
          event_name: eventName,
          record: recordValue || undefined,
          record_date: recordDate || undefined,
          memo: memo || undefined,
        });
      }
      onSave();
      onClose();
    } catch {
      alert("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl w-full max-w-md">
        <div className="p-4 border-b dark:border-zinc-700 flex items-center justify-between">
          <h2 className="font-bold text-lg">{record ? "기록 수정" : "기록 추가"}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">종목</label>
            <select
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              disabled={!!record}
              className="w-full px-4 py-3 border rounded-xl dark:bg-zinc-700 dark:border-zinc-600 disabled:opacity-50"
            >
              <option value="">선택하세요</option>
              {eventTypes.map((event) => (
                <option key={event.id} value={event.name}>
                  {event.name} {event.unit && `(${event.unit})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              기록{" "}
              {selectedEventType?.unit && (
                <span className="text-zinc-400 font-normal">({selectedEventType.unit})</span>
              )}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={recordValue}
              onChange={(e) => setRecordValue(e.target.value)}
              placeholder={
                selectedEventType?.unit
                  ? `예: 12.5${selectedEventType.unit}`
                  : "예: 12.5초, 2.8m"
              }
              className="w-full px-4 py-3 border rounded-xl dark:bg-zinc-700 dark:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">측정일</label>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl dark:bg-zinc-700 dark:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 입력하세요"
              rows={2}
              className="w-full px-4 py-3 border rounded-xl dark:bg-zinc-700 dark:border-zinc-600 resize-none"
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
