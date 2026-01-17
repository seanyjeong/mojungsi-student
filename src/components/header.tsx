"use client";

import Image from "next/image";
import { useAuth } from "@/lib/auth";

export function Header() {
  const { user, isLoading, isLoggedIn, login, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
          정시 환산점수 계산기
        </h1>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="w-8 h-8 bg-zinc-100 rounded-full animate-pulse" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2">
              {user?.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={user.nickname || "프로필"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center text-xs font-medium text-zinc-600">
                  {user?.nickname?.charAt(0) || "?"}
                </div>
              )}
              <button
                onClick={logout}
                className="text-xs text-zinc-500 hover:text-zinc-700"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEE500] hover:bg-[#F6D600] text-[#3C1E1E] text-sm font-medium rounded-lg transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.47 1.607 4.647 4.033 5.905-.176.654-.637 2.371-.73 2.738-.117.461.17.454.357.33.147-.098 2.343-1.547 3.293-2.17.68.1 1.38.152 2.094.152 5.523 0 10-3.477 10-7.455C22 6.477 17.523 3 12 3z" />
              </svg>
              카카오 로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
