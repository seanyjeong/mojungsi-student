"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { loadScores } from "@/lib/storage";
import { Search, Heart, Dumbbell, User } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuth();
  const [hasScores, setHasScores] = useState(false);

  useEffect(() => {
    const scores = loadScores();
    setHasScores(!!(scores && Object.keys(scores).length > 0));
  }, []);

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

      {/* Quick Info */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-sm text-zinc-600 dark:text-zinc-400">
        <p className="font-medium mb-2">이용 안내</p>
        <ul className="space-y-1 text-xs">
          <li>• 내 정보에서 모의고사/수능 성적을 입력하세요</li>
          <li>• 대학 검색에서 환산점수를 확인하세요</li>
          <li>• 관심 대학은 하트를 눌러 저장하세요</li>
        </ul>
      </div>
    </div>
  );
}
