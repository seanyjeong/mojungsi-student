"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getToken } from "@/lib/auth";
import {
  getPracticalRecords,
  createPracticalRecord,
  updatePracticalRecord,
  deletePracticalRecord,
} from "@/lib/api";
import { Plus, Trash2, Edit2, Save, X, Dumbbell, Calendar, FileText } from "lucide-react";

interface PracticalRecord {
  id: number;
  event_name: string;
  record: string | null;
  record_date: string | null;
  memo: string | null;
}

const 실기종목목록 = [
  "100m",
  "200m",
  "400m",
  "800m",
  "1500m",
  "제자리멀리뛰기",
  "배근력",
  "윗몸일으키기",
  "턱걸이",
  "메디신볼던지기",
  "사이드스텝",
  "체전굴",
  "왕복달리기",
  "농구",
  "축구",
  "수영",
  "기타",
];

export default function PracticalPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const [records, setRecords] = useState<PracticalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PracticalRecord | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) {
      loadRecords();
    }
  }, [isLoggedIn]);

  const loadRecords = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await getPracticalRecords(token);
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const token = getToken();
    if (!token) return;
    try {
      await deletePracticalRecord(token, id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
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

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Dumbbell className="w-16 h-16 text-zinc-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
        <p className="text-zinc-500 mb-4">실기 기록 관리를 위해<br />로그인해 주세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">실기 기록 관리</h1>
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
          {Object.entries(groupedRecords).map(([eventName, eventRecords]) => (
            <div key={eventName} className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-3">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" /> {eventName}
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
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <RecordModal
          onClose={() => setShowAddModal(false)}
          onSave={loadRecords}
        />
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <RecordModal
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={loadRecords}
        />
      )}
    </div>
  );
}

function RecordModal({
  record,
  onClose,
  onSave,
}: {
  record?: PracticalRecord;
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
    } catch (err) {
      alert("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl w-full max-w-md">
        <div className="p-4 border-b dark:border-zinc-700 flex items-center justify-between">
          <h2 className="font-bold text-lg">
            {record ? "기록 수정" : "기록 추가"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full">
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
              {실기종목목록.map((event) => (
                <option key={event} value={event}>
                  {event}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">기록</label>
            <input
              type="text"
              value={recordValue}
              onChange={(e) => setRecordValue(e.target.value)}
              placeholder="예: 12.5초, 2.8m"
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
