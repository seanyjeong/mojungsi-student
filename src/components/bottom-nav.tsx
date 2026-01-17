"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, Search, Heart, Dumbbell, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "성적입력", icon: Calculator },
    { href: "/search", label: "대학검색", icon: Search },
    { href: "/my-universities", label: "저장대학", icon: Heart },
    { href: "/practical", label: "실기관리", icon: Dumbbell },
    { href: "/mypage", label: "내정보", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 z-20">
      <div className="max-w-2xl mx-auto px-4 py-3 flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-h-[48px] min-w-[48px] justify-center",
                isActive
                  ? "text-primary"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
