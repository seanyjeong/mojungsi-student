"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getToken, useRequireProfile } from "@/lib/auth";
import { getPracticalRecords, getEventTypes, EventType } from "@/lib/api";
import { Dumbbell, LineChart, Settings, ClipboardList } from "lucide-react";
import RecordTab from "./components/RecordTab";
import GrowthChart from "./components/GrowthChart";
import EventSettings from "./components/EventSettings";

interface PracticalRecord {
  id: number;
  event_name: string;
  record: string | null;
  record_date: string | null;
  memo: string | null;
}

type TabType = "records" | "chart" | "settings";

export default function PracticalPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  useRequireProfile();
  const [records, setRecords] = useState<PracticalRecord[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("records");

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const loadData = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const [recordsData, typesData] = await Promise.all([
        getPracticalRecords(token),
        getEventTypes(token),
      ]);
      setRecords(recordsData);
      setEventTypes(typesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Dumbbell className="w-16 h-16 text-zinc-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
        <p className="text-zinc-500 mb-4">
          실기 기록 관리를 위해
          <br />
          로그인해 주세요
        </p>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "records", label: "기록 관리", icon: <ClipboardList className="w-4 h-4" /> },
    { id: "chart", label: "성장 그래프", icon: <LineChart className="w-4 h-4" /> },
    { id: "settings", label: "종목 설정", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-2">
        <Dumbbell className="w-6 h-6 text-purple-500" />
        <h1 className="text-xl font-bold">실기 기록 관리</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "records" && (
          <RecordTab records={records} eventTypes={eventTypes} onRefresh={loadData} />
        )}
        {activeTab === "chart" && <GrowthChart eventTypes={eventTypes} records={records} />}
        {activeTab === "settings" && (
          <EventSettings eventTypes={eventTypes} onRefresh={loadData} />
        )}
      </div>
    </div>
  );
}
