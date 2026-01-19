"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getToken } from "@/lib/auth";
import { getScores, getActiveYear, getLatestNotices, markNoticeAsRead, Notice } from "@/lib/api";
import { Search, Heart, Dumbbell, User, Bell, X, AlertTriangle, Sparkles } from "lucide-react";
import Link from "next/link";

const typeStyles = {
  general: { bg: "bg-gray-100", text: "text-gray-700", label: "일반", icon: Bell },
  urgent: { bg: "bg-red-100", text: "text-red-700", label: "긴급", icon: AlertTriangle },
  event: { bg: "bg-purple-100", text: "text-purple-700", label: "이벤트", icon: Sparkles },
};

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const [hasScores, setHasScores] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const checkScores = async () => {
      const token = getToken();
      if (!token) {
        setHasScores(false);
        return;
      }
      try {
        const scores = await getScores(token);
        setHasScores(!!(scores && scores.length > 0 && scores.some((s: any) => s.scores)));
      } catch {
        setHasScores(false);
      }
    };
    checkScores();
  }, [isLoggedIn]);

  // 공지사항 조회
  useEffect(() => {
    const fetchNotices = async () => {
      const token = getToken();
      const data = await getLatestNotices(token || undefined);
      setNotices(data);
    };
    fetchNotices();
  }, [isLoggedIn]);

  // 공지 클릭 시
  const handleNoticeClick = async (notice: Notice) => {
    setSelectedNotice(notice);
    const token = getToken();
    if (token && !notice.isRead) {
      await markNoticeAsRead(token, notice.id);
      setNotices((prev) =>
        prev.map((n) => (n.id === notice.id ? { ...n, isRead: true } : n))
      );
    }
  };

  const menuItems = [
    {
      href: "/search",
      icon: Search,
      title: "대학 검색",
      desc: "전국 체대 환산점수 확인",
      color: "bg-blue-500",
    },
    {
      href: "/my-universities",
      icon: Heart,
      title: "저장한 대학",
      desc: "관심 대학 모아보기",
      color: "bg-red-500",
      requireLogin: true,
    },
    {
      href: "/practical",
      icon: Dumbbell,
      title: "실기 관리",
      desc: "실기 기록 입력/관리",
      color: "bg-purple-500",
      requireLogin: true,
    },
    {
      href: "/mypage",
      icon: User,
      title: "내 정보",
      desc: "성적 입력 및 관리",
      color: "bg-green-500",
      requireLogin: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-xl font-bold mb-2">정시 환산점수 계산기</h1>
        <p className="text-sm opacity-90">
          {hasScores
            ? "성적이 입력되어 있습니다. 대학 검색에서 환산점수를 확인하세요."
            : "내 정보에서 성적을 입력하면 대학별 환산점수를 확인할 수 있습니다."}
        </p>
        {!hasScores && (
          <Link
            href="/mypage"
            className="inline-block mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
          >
            성적 입력하러 가기 →
          </Link>
        )}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item) => {
          const isDisabled = item.requireLogin && !isLoggedIn && !isLoading;

          return (
            <Link
              key={item.href}
              href={isDisabled ? "#" : item.href}
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault();
                  alert("로그인이 필요합니다");
                }
              }}
              className={`bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm transition ${
                isDisabled ? "opacity-50" : "hover:shadow-md"
              }`}
            >
              <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Notices Section */}
      {notices.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">공지사항</span>
          </div>
          {notices.map((notice) => {
            const style = typeStyles[notice.type];
            const Icon = style.icon;
            return (
              <button
                key={notice.id}
                onClick={() => handleNoticeClick(notice)}
                className="w-full text-left bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${style.bg}`}>
                    <Icon className={`w-4 h-4 ${style.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                      {!notice.isRead && isLoggedIn && (
                        <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-blue-500 text-white">
                          NEW
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-zinc-900 dark:text-white truncate">
                      {notice.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      {notice.content}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Quick Info */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-sm text-zinc-600 dark:text-zinc-400">
        <p className="font-medium mb-2">📋 이용 안내</p>
        <ul className="space-y-1.5 text-xs">
          <li><span className="font-medium text-blue-600">1.</span> 내 정보에서 모의고사/수능 성적을 입력하세요</li>
          <li><span className="font-medium text-blue-600">2.</span> 대학 검색에서 환산점수를 확인하세요</li>
          <li><span className="font-medium text-blue-600">3.</span> 관심 대학은 하트를 눌러 저장하세요</li>
        </ul>

        <p className="font-medium mt-4 mb-2">🏃 실기 관리 사용법</p>
        <ul className="space-y-1.5 text-xs">
          <li><span className="font-medium text-purple-600">1.</span> 실기관리 → <span className="font-medium">종목 설정</span> 탭에서 관리할 종목 추가</li>
          <li><span className="font-medium text-purple-600">2.</span> <span className="font-medium">기록 관리</span> 탭에서 날짜별 기록 입력</li>
          <li><span className="font-medium text-purple-600">3.</span> <span className="font-medium">성장 그래프</span>에서 실력 변화 확인</li>
        </ul>
      </div>

      {/* Notice Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${typeStyles[selectedNotice.type].bg} ${typeStyles[selectedNotice.type].text}`}>
                  {typeStyles[selectedNotice.type].label}
                </span>
                <span className="text-xs text-zinc-400">
                  {new Date(selectedNotice.created_at).toLocaleDateString("ko-KR")}
                </span>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-3">
                {selectedNotice.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                {selectedNotice.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
