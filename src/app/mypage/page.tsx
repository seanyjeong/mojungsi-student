"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getToken } from "@/lib/auth";
import { getProfile, updateProfile, getScores, saveScore } from "@/lib/api";
import { saveScores as saveToStorage, saveCalcExamType, loadCalcExamType } from "@/lib/storage";
import { ScoreForm } from "@/types";
import { User, Pencil, Save, Book, Calculator, Globe, Landmark, Search } from "lucide-react";

const EXAM_TYPES = ["3월모의", "6월모의", "9월모의", "수능"];

const 탐구과목 = [
  "생활과윤리", "윤리와사상", "한국지리", "세계지리", "동아시아사", "세계사", "정치와법", "경제", "사회문화",
  "물리1", "화학1", "생명과학1", "지구과학1", "물리2", "화학2", "생명과학2", "지구과학2"
];

interface Profile {
  name?: string;
  school?: string;
  grade?: number;
  gender?: string;
  nickname?: string;
  profileImage?: string;
}

interface ScoreData {
  국어_선택과목?: string;
  국어_원점수?: number;
  국어_표준점수?: number;
  국어_백분위?: number;
  국어_등급?: number;
  수학_선택과목?: string;
  수학_원점수?: number;
  수학_표준점수?: number;
  수학_백분위?: number;
  수학_등급?: number;
  영어_원점수?: number;
  영어_등급?: number;
  한국사_원점수?: number;
  한국사_등급?: number;
  탐구1_선택과목?: string;
  탐구1_원점수?: number;
  탐구1_표준점수?: number;
  탐구1_백분위?: number;
  탐구1_등급?: number;
  탐구2_선택과목?: string;
  탐구2_원점수?: number;
  탐구2_표준점수?: number;
  탐구2_백분위?: number;
  탐구2_등급?: number;
}

export default function MyPage() {
  const router = useRouter();
  const { user, isLoading, isLoggedIn, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"info" | "scores">("info");
  const [profile, setProfile] = useState<Profile>({});
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedExam, setSelectedExam] = useState("수능");
  const [calcExam, setCalcExam] = useState("수능"); // 계산에 사용할 시험
  const [scores, setScores] = useState<Record<string, ScoreData>>({});
  const [currentScore, setCurrentScore] = useState<ScoreData>({});
  const [scoreSaving, setScoreSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn) {
      loadProfile();
      loadScores();
    }
    // 계산에 사용할 시험 타입 로드
    setCalcExam(loadCalcExamType());
  }, [isLoggedIn]);

  useEffect(() => {
    if (scores[selectedExam]) {
      setCurrentScore(scores[selectedExam]);
    } else {
      setCurrentScore({});
    }
  }, [selectedExam, scores]);

  const loadProfile = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await getProfile(token);
      setProfile({
        name: data.name || "",
        school: data.school || "",
        grade: data.grade || undefined,
        gender: data.gender || "",
        nickname: data.nickname || "",
        profileImage: data.profile_image || "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const loadScores = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await getScores(token, 2026);
      const map: Record<string, ScoreData> = {};
      data.forEach((s: any) => {
        map[s.exam_type] = s.scores || {};
      });
      setScores(map);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async () => {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      await updateProfile(token, {
        name: profile.name,
        school: profile.school,
        grade: profile.grade,
        gender: profile.gender,
      });
      setEditMode(false);
      setMessage("✅ 프로필이 저장되었습니다!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ 프로필 저장에 실패했습니다");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  // 한글 형식을 ScoreForm 형식으로 변환
  const convertToScoreForm = (data: ScoreData): ScoreForm => {
    return {
      korean: {
        subject: data.국어_선택과목 || "화법과작문",
        std: data.국어_표준점수 || 0,
        pct: data.국어_백분위 || 0,
        grade: data.국어_등급 || 0,
      },
      math: {
        subject: data.수학_선택과목 || "미적분",
        std: data.수학_표준점수 || 0,
        pct: data.수학_백분위 || 0,
        grade: data.수학_등급 || 0,
      },
      english: {
        grade: data.영어_등급 || 5,
      },
      history: {
        grade: data.한국사_등급 || 4,
      },
      inquiry1: {
        subject: data.탐구1_선택과목 || "",
        std: data.탐구1_표준점수 || 0,
        pct: data.탐구1_백분위 || 0,
        grade: data.탐구1_등급 || 0,
      },
      inquiry2: {
        subject: data.탐구2_선택과목 || "",
        std: data.탐구2_표준점수 || 0,
        pct: data.탐구2_백분위 || 0,
        grade: data.탐구2_등급 || 0,
      },
    };
  };

  const handleSaveScore = async () => {
    const token = getToken();
    if (!token) return;
    setScoreSaving(true);
    try {
      await saveScore(token, selectedExam, currentScore, 2026);
      setScores(prev => ({ ...prev, [selectedExam]: currentScore }));

      // 현재 선택된 계산 시험이면 localStorage에도 저장 (대학검색에서 사용)
      if (selectedExam === calcExam) {
        const scoreForm = convertToScoreForm(currentScore);
        saveToStorage(scoreForm);
      }

      setMessage("✅ 성적이 저장되었습니다!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ 저장에 실패했습니다");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setScoreSaving(false);
    }
  };

  // 계산에 사용할 시험 변경
  const handleSetCalcExam = (exam: string) => {
    setCalcExam(exam);
    saveCalcExamType(exam);
    // 해당 시험의 성적이 있으면 localStorage에 저장
    if (scores[exam]) {
      const scoreForm = convertToScoreForm(scores[exam]);
      saveToStorage(scoreForm);
      setMessage(`✅ "${exam}" 성적으로 계산합니다!`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <User className="w-16 h-16 text-zinc-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
        <p className="text-zinc-500 mb-4">내 정보 확인을 위해<br />로그인해 주세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur">
            {profile.name?.charAt(0) || user?.nickname?.charAt(0) || "?"}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.name || user?.nickname || "이름 미입력"}</h2>
            <p className="text-white/80 text-sm">{profile.school || "학교 정보 없음"}</p>
          </div>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === "info"
              ? "bg-white dark:bg-zinc-700 shadow text-blue-600 dark:text-blue-400"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          내 정보
        </button>
        <button
          onClick={() => setActiveTab("scores")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === "scores"
              ? "bg-white dark:bg-zinc-700 shadow text-blue-600 dark:text-blue-400"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          성적 관리
        </button>
      </div>

      {/* Toast Notification */}
      {message && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl text-base font-semibold transform transition-all duration-300 ${
          message.includes("✅")
            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
        }`}>
          {message}
        </div>
      )}

      {/* Info Tab */}
      {activeTab === "info" && (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" /> 내 정보
            </h3>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="text-blue-500 text-sm flex items-center gap-1"
              >
                <Pencil className="w-4 h-4" /> 수정
              </button>
            ) : (
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
              >
                <Save className="w-4 h-4" /> {saving ? "저장중..." : "저장"}
              </button>
            )}
          </div>

          <div className="space-y-3">
            <InfoRow label="이름" value={profile.name} editMode={editMode}
              onChange={(v) => setProfile(p => ({ ...p, name: v }))} />
            <InfoRow label="학교" value={profile.school} editMode={editMode}
              onChange={(v) => setProfile(p => ({ ...p, school: v }))} />
            <InfoRow label="학년" value={profile.grade?.toString()} editMode={editMode} type="number"
              onChange={(v) => setProfile(p => ({ ...p, grade: v ? parseInt(v) : undefined }))} />
            <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-700">
              <span className="text-zinc-500 text-sm">성별</span>
              {editMode ? (
                <select
                  value={profile.gender || ""}
                  onChange={(e) => setProfile(p => ({ ...p, gender: e.target.value }))}
                  className="text-sm border rounded-lg px-2 py-1 dark:bg-zinc-700 dark:border-zinc-600"
                >
                  <option value="">선택</option>
                  <option value="남">남</option>
                  <option value="여">여</option>
                </select>
              ) : (
                <span className="font-medium">{profile.gender || "미입력"}</span>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full mt-6 py-3 border border-red-300 text-red-500 rounded-xl hover:bg-red-50 transition"
          >
            로그아웃
          </button>
        </div>
      )}

      {/* Scores Tab */}
      {activeTab === "scores" && (
        <div className="space-y-4">
          {/* Exam Type Selector */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-zinc-500 mb-3">성적 입력할 시험 선택</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {EXAM_TYPES.map((exam) => (
                <button
                  key={exam}
                  onClick={() => setSelectedExam(exam)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    selectedExam === exam
                      ? "bg-blue-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border dark:border-zinc-700"
                  }`}
                >
                  {exam}
                </button>
              ))}
            </div>

            {/* 계산에 사용할 시험 선택 */}
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
              <p className="text-sm text-zinc-500 mb-3">🧮 계산에 사용할 시험</p>
              <div className="flex gap-2 overflow-x-auto">
                {EXAM_TYPES.map((exam) => (
                  <button
                    key={exam}
                    onClick={() => handleSetCalcExam(exam)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                      calcExam === exam
                        ? "bg-green-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border dark:border-zinc-700"
                    }`}
                  >
                    {exam} {calcExam === exam && "✓"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                대학검색에서 {calcExam} 성적으로 환산점수를 계산합니다
              </p>
            </div>
          </div>

          {/* Score Input Cards */}
          <ScoreCard
            title="국어"
            icon={<Book className="w-4 h-4" />}
            color="red"
            score={currentScore}
            setScore={setCurrentScore}
            subjectKey="국어"
            subjectOptions={["화법과작문", "언어와매체"]}
          />

          <ScoreCard
            title="수학"
            icon={<Calculator className="w-4 h-4" />}
            color="teal"
            score={currentScore}
            setScore={setCurrentScore}
            subjectKey="수학"
            subjectOptions={["확률과통계", "미적분", "기하"]}
          />

          <ScoreCard
            title="영어"
            icon={<Globe className="w-4 h-4" />}
            color="yellow"
            score={currentScore}
            setScore={setCurrentScore}
            subjectKey="영어"
            noSubject
            noStandardScore
          />

          <ScoreCard
            title="한국사"
            icon={<Landmark className="w-4 h-4" />}
            color="orange"
            score={currentScore}
            setScore={setCurrentScore}
            subjectKey="한국사"
            noSubject
            noStandardScore
          />

          <ScoreCard
            title="탐구1"
            icon={<Search className="w-4 h-4" />}
            color="purple"
            score={currentScore}
            setScore={setCurrentScore}
            subjectKey="탐구1"
            subjectOptions={탐구과목}
            fullWidthSubject
          />

          <ScoreCard
            title="탐구2"
            icon={<Search className="w-4 h-4" />}
            color="blue"
            score={currentScore}
            setScore={setCurrentScore}
            subjectKey="탐구2"
            subjectOptions={탐구과목}
            fullWidthSubject
          />

          <button
            onClick={handleSaveScore}
            disabled={scoreSaving}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
          >
            {scoreSaving ? "저장 중..." : "성적 저장하기"}
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  editMode,
  onChange,
  type = "text",
}: {
  label: string;
  value?: string;
  editMode: boolean;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-700">
      <span className="text-zinc-500 text-sm">{label}</span>
      {editMode ? (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm border rounded-lg px-2 py-1 w-40 text-right dark:bg-zinc-700 dark:border-zinc-600"
        />
      ) : (
        <span className="font-medium">{value || "미입력"}</span>
      )}
    </div>
  );
}

function ScoreCard({
  title,
  icon,
  color,
  score,
  setScore,
  subjectKey,
  subjectOptions,
  noSubject,
  noStandardScore,
  fullWidthSubject,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  score: ScoreData;
  setScore: (fn: (s: ScoreData) => ScoreData) => void;
  subjectKey: string;
  subjectOptions?: string[];
  noSubject?: boolean;
  noStandardScore?: boolean;
  fullWidthSubject?: boolean;
}) {
  const colorMap: Record<string, string> = {
    red: "border-l-red-500 text-red-600",
    teal: "border-l-teal-500 text-teal-600",
    yellow: "border-l-yellow-500 text-yellow-600",
    orange: "border-l-orange-500 text-orange-600",
    purple: "border-l-purple-500 text-purple-600",
    blue: "border-l-blue-500 text-blue-600",
  };

  const getValue = (key: string) => (score as any)[`${subjectKey}_${key}`] ?? "";
  const setValue = (key: string, val: any) => {
    setScore((s) => ({ ...s, [`${subjectKey}_${key}`]: val === "" ? undefined : val }));
  };

  return (
    <div className={`bg-white dark:bg-zinc-800 rounded-xl p-4 border-l-4 ${colorMap[color]} shadow-sm`}>
      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${colorMap[color].split(" ")[1]}`}>
        {icon} {title}
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {!noSubject && subjectOptions && (
          <div className={fullWidthSubject ? "col-span-2" : ""}>
            <label className="text-xs text-zinc-500 mb-1 block">선택과목</label>
            <select
              value={getValue("선택과목")}
              onChange={(e) => setValue("선택과목", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600"
            >
              <option value="">선택하세요</option>
              {subjectOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">원점수</label>
          <input
            type="number"
            value={getValue("원점수")}
            onChange={(e) => setValue("원점수", e.target.value ? parseInt(e.target.value) : "")}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600"
            placeholder="예: 88"
          />
        </div>
        {!noStandardScore && (
          <>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">표준점수</label>
              <input
                type="number"
                value={getValue("표준점수")}
                onChange={(e) => setValue("표준점수", e.target.value ? parseInt(e.target.value) : "")}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">백분위</label>
              <input
                type="number"
                value={getValue("백분위")}
                onChange={(e) => setValue("백분위", e.target.value ? parseInt(e.target.value) : "")}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600"
              />
            </div>
          </>
        )}
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">등급</label>
          <input
            type="number"
            min="1"
            max="9"
            value={getValue("등급")}
            onChange={(e) => setValue("등급", e.target.value ? parseInt(e.target.value) : "")}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-700 dark:border-zinc-600"
          />
        </div>
      </div>
    </div>
  );
}
